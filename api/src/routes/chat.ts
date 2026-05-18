// チャット API ルーター
// - POST   /api/chat          メッセージ送信 → AI 応答を返す
// - DELETE /api/chat/history  会話履歴リセット
// - GET    /api/chat/history  履歴取得 (デバッグ用)

import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { generateReply, ChatMessage } from "../lib/ai.js";
import { greetingMessage } from "../data/dummy-responses.js";

export const chatRouter = Router();

// インメモリで会話履歴を保持する。
// 本番ではユーザーごとに分けたり Redis や DB に永続化するが、教材ではプロセス全体で 1 セッション扱い。
interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

let history: StoredMessage[] = [];

// 初期メッセージを入れておく
function ensureGreeting() {
  if (history.length === 0) {
    history.push({
      id: createId(),
      role: "assistant",
      content: greetingMessage,
      createdAt: new Date().toISOString(),
    });
  }
}
ensureGreeting();

function createId() {
  return `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
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

    const userMessage = parsed.data.message.trim();

    // ユーザーメッセージを履歴に追加
    const userEntry: StoredMessage = {
      id: createId(),
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    history.push(userEntry);

    // AI 応答生成 (履歴のうち greeting 含む直近 10 件をコンテキストに)
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
    history.push(assistantEntry);

    res.json({ message: assistantEntry, history });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/chat/history
chatRouter.delete("/history", (_req: Request, res: Response) => {
  history = [];
  ensureGreeting();
  res.json({ ok: true, history });
});

// GET /api/chat/history (デバッグ用)
chatRouter.get("/history", (_req: Request, res: Response) => {
  res.json({ history });
});
