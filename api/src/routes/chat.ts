// チャット API ルーター
//
// 学習チャプター
// - Ch09 (09-api-skeleton)   ルートの骨組み、入力バリデーション
// - Ch10 (10-history)        会話履歴をインメモリで保持する
// - Ch12 (12-openai)         AI 応答の取得呼び出し
// - Ch13 (13-error-handling) zod バリデーション・エラーレスポンス整形
//
// このファイルは starter スケルトンです。
// 完成版は main ブランチを参照してください。

import { Router, Request, Response, NextFunction } from "express";
// TODO Ch13-error-handling
// import { z } from "zod"; を有効化し、リクエスト body のバリデーションを実装する。
// import { z } from "zod";

import { generateReply } from "../lib/ai.js";
// import { ChatMessage } from "../lib/ai.js"; // Ch12 で OpenAI に渡す型として使う
import { greetingMessage } from "../data/dummy-responses.js";

export const chatRouter = Router();

// TODO Ch10-history
// インメモリで会話履歴を保持する。
// - StoredMessage 型を作る (id, role, content, createdAt)
// - history: StoredMessage[] = []
// - 初期化時に greetingMessage を 1 件入れておく
// - createId() で一意な ID を作る (Date.now + random でよい)
//
// 教材ではプロセス全体で 1 セッション扱いにします。本番ではユーザーごとに分けたり、Redis や DB に永続化します。

interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

let history: StoredMessage[] = [];

function createId() {
  return `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

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

// TODO Ch13-error-handling
// zod でリクエスト body をバリデーションする。
// const chatBodySchema = z.object({
//   message: z.string({ required_error: "メッセージを入力してください" })
//     .min(1, "メッセージを入力してください")
//     .max(500, "500文字以内で入力してください"),
// });

// POST /api/chat
chatRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO Ch09-api-skeleton / Ch13-error-handling
    // 1. req.body.message を取り出す
    // 2. zod でバリデーション (空文字 / 500 文字超 / 未指定 をエラーにする)
    // 3. ユーザーメッセージを history に push する (Ch10)
    // 4. generateReply(contextHistory, userMessage) を呼び出して AI 応答を取得 (Ch12)
    //    contextHistory は history の直近 10 件 (greeting と今追加した user メッセージは除く)
    // 5. assistant 応答を history に push する (Ch10)
    // 6. res.json({ message: assistantEntry, history }) を返す
    //
    // ヒント (型を満たすためのプレースホルダ)
    void req;
    void generateReply;
    res.status(501).json({
      error: "Not implemented yet — see chapter 09-api-skeleton / 10-history / 12-openai",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/chat/history
chatRouter.delete("/history", (_req: Request, res: Response) => {
  // TODO Ch10-history
  // 会話履歴を空にリセットして、greeting だけ入った状態に戻す。
  // history = [];
  // ensureGreeting();
  // res.json({ ok: true, history });
  res.status(501).json({ error: "Not implemented yet — see chapter 10-history" });
});

// GET /api/chat/history (デバッグ用)
chatRouter.get("/history", (_req: Request, res: Response) => {
  // 履歴の取得は Ch10 で動かす。初期 starter では greeting だけ返る。
  res.json({ history });
});
