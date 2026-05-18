// OpenAI 連携 or モック切替。
// OPENAI_API_KEY が設定されていれば OpenAI Chat Completions API を呼び出す。
// 未設定なら data/dummy-responses.ts のマッチング結果を返す。

import { findDummyReply } from "../data/dummy-responses.js";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `あなたは「NORTH CRAFT」(オンラインストア NORTH CLOUT) のカスタマーサポート AI です。
日本の手仕事・国産素材にこだわった生活雑貨ブランドのスタッフとして、商品の素材・お手入れ・送料・ギフトラッピングについて丁寧に答えてください。
回答は 300 文字以内で、親しみやすい敬語を使ってください。
個人情報や注文番号を尋ねられた場合は「画面下の お問い合わせ から直接スタッフへご連絡ください」と案内してください。`;

/**
 * AI 応答を生成する。
 * - OPENAI_API_KEY あり: OpenAI Chat Completions API を呼び出す
 * - なし: dummy-responses からマッチング応答を返す
 */
export async function generateReply(history: ChatMessage[], userMessage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // 教材としてキー無しでも動くように、モック応答を返す。
    // 実 API を呼ぶ感覚に近づけるため、ほんの少しだけ遅延させる。
    await new Promise((resolve) => setTimeout(resolve, 600));
    return findDummyReply(userMessage);
  }

  // OpenAI 呼び出し (動的 import で API key 無し環境のビルドエラーを避ける)
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
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
