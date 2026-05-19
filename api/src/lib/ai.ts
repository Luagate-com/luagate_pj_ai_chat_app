// OpenAI 連携 or モック切替。
//
// バックエンド選択ロジック (chapter 12-openai)
// - 環境変数 `AI_BACKEND` が `openai` かつ `OPENAI_API_KEY` がセットされている場合のみ OpenAI を呼ぶ
// - それ以外 (mock / 未設定 / API キー欠落) は dummy-responses からマッチング応答を返す
// - OpenAI 呼び出し中に例外が出た場合もモック応答にフェイルセーフする

import { findDummyReply } from "../data/dummy-responses.js";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `あなたは「NORTH CRAFT」(オンラインストア NORTH CLOUT) のカスタマーサポート AI です。
日本の手仕事・国産素材にこだわった生活雑貨ブランドのスタッフとして、商品の素材・お手入れ・送料・ギフトラッピングについて丁寧に答えてください。
回答は 300 文字以内で、親しみやすい敬語を使ってください。
個人情報や注文番号を尋ねられた場合は「画面下の お問い合わせ から直接スタッフへご連絡ください」と案内してください。`;

// 現在の AI バックエンドを判定する。
// - "openai"  AI_BACKEND=openai かつ API キー有り
// - "mock"    上記以外すべて
export function resolveAiBackend(): "openai" | "mock" {
  const backend = process.env.AI_BACKEND ?? "mock";
  if (backend === "openai" && process.env.OPENAI_API_KEY) {
    return "openai";
  }
  return "mock";
}

async function generateMockReply(userMessage: string): Promise<string> {
  // 教材としてキー無しでも動くように、モック応答を返す。
  // 実 API を呼ぶ感覚に近づけるため、ほんの少しだけ遅延させる。
  await new Promise((resolve) => setTimeout(resolve, 600));
  return findDummyReply(userMessage);
}

async function generateOpenAIReply(history: ChatMessage[], userMessage: string): Promise<string> {
  // OpenAI 呼び出し (動的 import で API key 無し環境のビルドエラーを避ける)
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  // 直近 10 件のみ送ってトークンを節約する (chapter 12-openai)
  const recent = history.slice(-10);
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...recent,
    { role: "user", content: userMessage },
  ];

  const completion = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    max_tokens: 400,
  });

  const reply = completion.choices[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error("AI からの応答が空でした");
  }
  return reply;
}

/**
 * AI 応答を生成する。
 * - AI_BACKEND=openai かつ OPENAI_API_KEY がある場合のみ OpenAI を呼ぶ
 * - それ以外、または OpenAI 呼び出しが失敗したときはモック応答にフォールバックする
 */
export async function generateReply(history: ChatMessage[], userMessage: string): Promise<string> {
  if (resolveAiBackend() === "openai") {
    try {
      const text = await generateOpenAIReply(history, userMessage);
      if (text) return text;
    } catch (err) {
      console.error("[openai] fallback to mock", err);
    }
  }
  return generateMockReply(userMessage);
}
