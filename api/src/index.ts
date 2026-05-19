import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";

import { chatRouter } from "./routes/chat.js";
import { resolveAiBackend } from "./lib/ai.js";

const app = express();
const PORT = Number(process.env.PORT) || 3031;

// --- 共通ミドルウェア ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
    credentials: true,
    allowedHeaders: ["Content-Type", "X-Session-Id"],
  })
);
app.use(express.json({ limit: "1mb" }));

// ヘルスチェック (Cloud Run の Liveness 用)
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "luagate_pj_ai_chat_app",
    version: "1.0.0",
    aiBackend: resolveAiBackend(),
  });
});

// API ルート
app.use("/api/chat", chatRouter);

// 404 ハンドラ
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// エラーハンドラ
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[error]", err);
  res.status(500).json({
    error: "ただいま回答できません。しばらくしてから再度お試しください",
  });
});

app.listen(PORT, () => {
  console.log(`[luagate_pj_ai_chat_app] listening on :${PORT}`);
  console.log(`[luagate_pj_ai_chat_app] AI backend = ${resolveAiBackend()}`);
});
