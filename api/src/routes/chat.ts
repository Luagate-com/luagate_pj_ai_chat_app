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
import { z } from "zod";

import { generateReply } from "../lib/ai.js";
// import { ChatMessage } from "../lib/ai.js"; // Ch12 で OpenAI に渡す型として使う
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
// セッションの履歴を取得する。空なら greeting を 1 件入れて初期化する。
function getHistory(sessionId: string): StoredMessage[] {
  let list = store.get(sessionId);
  if (!list) {
    list = [
      {
        id: createId(),
        role: "assistant",
        content: greetingMessage,
        createdAt: new Date().toISOString(),
      },
    ];
    store.set(sessionId, list);
  }
  return list;
}

// Ch10-history
// セッション履歴に 1 件追加して MAX_HISTORY で末尾トリムする。
function appendMessage(sessionId: string, msg: StoredMessage): StoredMessage[] {
  const prev = getHistory(sessionId);
  const next = [...prev, msg].slice(-MAX_HISTORY);
  store.set(sessionId, next);
  return next;
}

// Ch10-history
// セッションの履歴を破棄して、greeting だけの初期状態に戻す。
function resetSession(sessionId: string): StoredMessage[] {
  store.delete(sessionId);
  return getHistory(sessionId);
}

// Ch09-api-skeleton — zod による入力バリデーション
// - message は 1〜500 文字
// - required_error で「未指定」エラーを別文言に
const chatBodySchema = z.object({
  message: z
    .string({ required_error: "メッセージを入力してください" })
    .min(1, "メッセージを入力してください")
    .max(500, "500文字以内で入力してください"),
});

// POST /api/chat (Ch10: 履歴管理 + モック応答までを実装)
chatRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = chatBodySchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.errors[0]?.message ?? "リクエストが不正です";
      return res.status(400).json({ error: first });
    }

    const sessionId = getSessionId(req);
    const userMessage = parsed.data.message.trim();

    // 1) ユーザーメッセージを履歴に追加
    const userEntry: StoredMessage = {
      id: createId(),
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    const afterUser = appendMessage(sessionId, userEntry);

    // 2) 直近 10 件 (今追加した user メッセージは除く) を AI に渡すコンテキストにする
    //    Ch12 で OpenAI に渡すための準備でもある
    const contextHistory = afterUser.slice(-11, -1).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const reply = await generateReply(contextHistory, userMessage);

    // 3) assistant 応答を履歴に追加
    const assistantEntry: StoredMessage = {
      id: createId(),
      role: "assistant",
      content: reply,
      createdAt: new Date().toISOString(),
    };
    const history = appendMessage(sessionId, assistantEntry);

    res.json({ message: assistantEntry, history });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/chat/history (Ch10-history)
chatRouter.delete("/history", (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const history = resetSession(sessionId);
  res.json({ ok: true, history });
});

// GET /api/chat/history (Ch10-history)
chatRouter.get("/history", (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  res.json({ history: getHistory(sessionId) });
});
