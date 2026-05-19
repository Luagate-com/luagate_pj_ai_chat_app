// チャット API ルーター
// - POST   /api/chat          メッセージ送信 → AI 応答を返す
// - DELETE /api/chat/history  会話履歴リセット
// - GET    /api/chat/history  履歴取得 (デバッグ用)
//
// セッション分離方針 (chapter 10-history)
// - sessionId は HTTP ヘッダ `X-Session-Id` で受け取る (Frontend が crypto.randomUUID で発行)
// - 履歴は Map<sessionId, StoredMessage[]> でセッション別に保持する
// - ヘッダが無い / 不正な場合は "default" を使う (=== 本番投入前のデバッグ用挙動)

import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { generateReply, ChatMessage } from "../lib/ai.js";
import { greetingMessage } from "../data/dummy-responses.js";

export const chatRouter = Router();

// インメモリで会話履歴を保持する。
// セッションごとに別配列を持つことで、複数ユーザーが同時アクセスしても会話が混ざらない。
// 本番では Redis や DB に差し替えるが、教材では Map で十分。
interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const MAX_HISTORY = 20;
const store = new Map<string, StoredMessage[]>();

function createId() {
  return `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// X-Session-Id ヘッダを安全に取り出す。
// - 64 文字以下の文字列のみ受け入れる
// - 不正・未指定なら "default" にフォールバック (教材方針)
function getSessionId(req: Request): string {
  const raw = req.header("x-session-id");
  if (typeof raw === "string" && raw.length > 0 && raw.length <= 64) {
    return raw;
  }
  return "default";
}

// セッションの履歴を取得する。空なら greeting を 1 件入れた状態で初期化する。
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

// 履歴に 1 件追加して MAX_HISTORY で末尾トリムする。
function appendMessage(sessionId: string, msg: StoredMessage): StoredMessage[] {
  const prev = getHistory(sessionId);
  const next = [...prev, msg].slice(-MAX_HISTORY);
  store.set(sessionId, next);
  return next;
}

// セッションの履歴を破棄して、greeting だけの初期状態に戻す。
function resetSession(sessionId: string): StoredMessage[] {
  store.delete(sessionId);
  return getHistory(sessionId);
}

const chatBodySchema = z.object({
  message: z
    .string({ required_error: "メッセージを入力してください" })
    .min(1, "メッセージを入力してください")
    .max(500, "500文字以内で入力してください"),
});

// POST /api/chat
chatRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = chatBodySchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.errors[0]?.message ?? "リクエストが不正です";
      return res.status(400).json({ error: first });
    }

    const sessionId = getSessionId(req);
    const userMessage = parsed.data.message.trim();

    // ユーザーメッセージをセッション履歴に追加
    const userEntry: StoredMessage = {
      id: createId(),
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    let history = appendMessage(sessionId, userEntry);

    // AI 応答生成 (OpenAI には直近 10 件のみ送る)
    // - 直近 10 件 = 今追加した user メッセージを含む
    // - generateReply 側は最後の userText を別引数で受け取るので、history からは末尾の user を除く
    const contextHistory: ChatMessage[] = history.slice(-11, -1).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const reply = await generateReply(contextHistory, userMessage);

    const assistantEntry: StoredMessage = {
      id: createId(),
      role: "assistant",
      content: reply,
      createdAt: new Date().toISOString(),
    };
    history = appendMessage(sessionId, assistantEntry);

    res.json({ message: assistantEntry, history });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/chat/history
chatRouter.delete("/history", (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const history = resetSession(sessionId);
  res.json({ ok: true, history });
});

// GET /api/chat/history (デバッグ用)
chatRouter.get("/history", (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const history = getHistory(sessionId);
  res.json({ history });
});
