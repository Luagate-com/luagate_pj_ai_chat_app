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

// TODO Ch10-history
// セッションの履歴を取得する。
// - store に無ければ greeting を 1 件入れて初期化
// - store にあればそのまま返す
function getHistory(sessionId: string): StoredMessage[] {
  // ヒント
  // - store.get(sessionId) が undefined なら新規セッション
  // - 新規セッションには greetingMessage を 1 件 push した配列を作って store.set する
  // - 既存なら store.get の結果をそのまま返す
  void sessionId;
  void greetingMessage;
  throw new Error("Not implemented yet — see chapter 10-history");
}

// TODO Ch10-history
// セッション履歴にメッセージを 1 件追加して MAX_HISTORY で末尾トリムする。
function appendMessage(sessionId: string, msg: StoredMessage): StoredMessage[] {
  // ヒント
  // - 既存履歴を getHistory(sessionId) で取り出す
  // - [...prev, msg].slice(-MAX_HISTORY) で末尾 20 件にトリム
  // - store.set(sessionId, next) で書き戻す
  void sessionId;
  void msg;
  void MAX_HISTORY;
  throw new Error("Not implemented yet — see chapter 10-history");
}

// TODO Ch10-history
// セッションの履歴を破棄して、greeting だけの初期状態に戻す。
function resetSession(sessionId: string): StoredMessage[] {
  // ヒント
  // - store.delete(sessionId) で削除
  // - getHistory(sessionId) を呼ぶと greeting だけ入った配列が返る
  void sessionId;
  throw new Error("Not implemented yet — see chapter 10-history");
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

// POST /api/chat (Ch09: 骨組み + バリデーションのみ。実応答は Ch10 で実装)
chatRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = chatBodySchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.errors[0]?.message ?? "リクエストが不正です";
      return res.status(400).json({ error: first });
    }

    // 後続の Ch10-history / Ch12-openai でここを完成させる
    void generateReply;
    void appendMessage;
    void getSessionId;
    void createId;
    res.status(501).json({
      error: "Not implemented yet — see chapter 10-history",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/chat/history
chatRouter.delete("/history", (req: Request, res: Response) => {
  // TODO Ch10-history
  // 現セッション (X-Session-Id ヘッダで指定) の履歴を空にリセットして、greeting だけ入った状態に戻す。
  // const sessionId = getSessionId(req);
  // const history = resetSession(sessionId);
  // res.json({ ok: true, history });
  void req;
  void resetSession;
  res.status(501).json({ error: "Not implemented yet — see chapter 10-history" });
});

// GET /api/chat/history (デバッグ用)
chatRouter.get("/history", (req: Request, res: Response) => {
  // 履歴の取得は Ch10 で動かす。初期 starter では空配列を返す。
  // 完成形では const sessionId = getSessionId(req); res.json({ history: getHistory(sessionId) });
  void req;
  void getHistory;
  res.json({ history: [] });
});
