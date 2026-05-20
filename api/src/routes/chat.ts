// チャット API ルーター
//
// 学習チャプター
// - Ch09 (09-api-skeleton)   ルートの骨組み、入力バリデーション
// - Ch10 (10-history)        Map<sessionId, Message[]> で会話履歴をセッション別に保持する
// - Ch12 (12-openai)         AI_BACKEND=openai のとき OpenAI を呼び、それ以外はモックに分岐
// - Ch13 (13-error-handling) zod バリデーション・エラーレスポンス整形
//
// このファイルは starter スケルトンです。
// 完成版は main ブランチを参照してください。

import { Router, Request, Response, NextFunction } from "express";
// Ch13-error-handling: zod でリクエスト body をバリデーションする。
import { z } from "zod";

import { generateReply } from "../lib/ai.js";
import { ChatMessage } from "../lib/ai.js"; // Ch12 で OpenAI に渡す型として使う
import { greetingMessage } from "../data/dummy-responses.js";

export const chatRouter = Router();

// 履歴 1 件を表す型 (Ch10 で完成させる)
interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

// セッション別の履歴ストア。
// - キー: X-Session-Id ヘッダの値 (Frontend が crypto.randomUUID で発行)
// - 値: そのセッションの会話メッセージ配列
// - 本番では Redis や DB に差し替えるが、教材ではメモリ上の Map で十分。
const MAX_HISTORY = 20;
const store = new Map<string, StoredMessage[]>();

function createId() {
  return `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// X-Session-Id ヘッダを取り出す。
// - 64 文字以下なら採用、それ以外は "default" にフォールバック
function getSessionId(req: Request): string {
  const raw = req.header("x-session-id");
  if (typeof raw === "string" && raw.length > 0 && raw.length <= 64) {
    return raw;
  }
  return "default";
}

// Ch10-history
// セッションの履歴を取得する。
// - store に無ければ greeting を 1 件入れて初期化
// - store にあればそのまま返す
function getHistory(sessionId: string): StoredMessage[] {
  const existing = store.get(sessionId);
  if (existing && existing.length > 0) {
    return existing;
  }
  // 空セッションには assistant の挨拶を 1 件だけ自動投入する
  const greeting: StoredMessage = {
    id: createId(),
    role: "assistant",
    content: greetingMessage,
    createdAt: new Date().toISOString(),
  };
  return appendMessage(sessionId, greeting);
}

// Ch10-history
// セッション履歴にメッセージを 1 件追加して MAX_HISTORY で末尾トリムする。
function appendMessage(sessionId: string, msg: StoredMessage): StoredMessage[] {
  const prev = store.get(sessionId) ?? [];
  const next = [...prev, msg].slice(-MAX_HISTORY);
  store.set(sessionId, next);
  return next;
}

// Ch10-history
// セッションの履歴を破棄して、greeting だけの初期状態に戻す。
function resetSession(sessionId: string): StoredMessage[] {
  store.delete(sessionId);
  // getHistory を呼ぶと greeting だけ入った配列が返る
  return getHistory(sessionId);
}

// Ch13-error-handling
// zod でリクエスト body をバリデーションする。
// 文字数上限は 500 (フロント ChatInput の MAX_LENGTH と一致させる)
const chatBodySchema = z.object({
  message: z
    .string({ required_error: "メッセージを入力してください" })
    .min(1, "メッセージを入力してください")
    .max(500, "500文字以内で入力してください"),
});

// AI に送る直近件数 (保持 20 件のうち直近 10 件のみ context として渡す)
const SEND_TO_AI = 10;

// POST /api/chat
chatRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. zod でリクエスト body をバリデーション
    const parsed = chatBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors[0]?.message ?? "入力内容を確認してください",
      });
      return;
    }
    const userMessage = parsed.data.message;

    // 2. セッション ID を取得
    const sessionId = getSessionId(req);

    // 3. ユーザーメッセージを履歴に追加
    const userEntry: StoredMessage = {
      id: createId(),
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    appendMessage(sessionId, userEntry);

    // 4. AI 応答を取得 (直近 10 件を context として渡す)
    const context: ChatMessage[] = getHistory(sessionId)
      .slice(-SEND_TO_AI)
      .map((m) => ({ role: m.role, content: m.content }));
    const replyText = await generateReply(context, userMessage);

    // 5. assistant 応答を履歴に追加
    const assistantEntry: StoredMessage = {
      id: createId(),
      role: "assistant",
      content: replyText,
      createdAt: new Date().toISOString(),
    };
    const history = appendMessage(sessionId, assistantEntry);

    // 6. レスポンスの key は message で統一
    res.json({ message: assistantEntry, history });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/chat/history
chatRouter.delete("/history", (req: Request, res: Response) => {
  // 現セッションの履歴を空にリセットして、greeting だけ入った状態に戻す。
  const sessionId = getSessionId(req);
  const history = resetSession(sessionId);
  res.json({ ok: true, history });
});

// GET /api/chat/history
chatRouter.get("/history", (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  res.json({ history: getHistory(sessionId) });
});
