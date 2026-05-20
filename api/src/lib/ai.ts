// OpenAI 連携 or モック切替を行うモジュール。
//
// 学習チャプター
// - Ch12 (12-openai)         OpenAI Chat Completions API の呼び出し方と AI_BACKEND スイッチ
// - Ch13 (13-error-handling) AI 応答エラー時のフェイルセーフ実装
//
// 受講生が完成させる箇所には TODO を残しています。
// 完成版は main ブランチを参照してください。

import { findDummyReply } from "../data/dummy-responses.js";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Ch12-openai — OpenAI 用システムプロンプト
// 役割 / トーン / ガードレールをまとめて定義
const SYSTEM_PROMPT = `あなたは「NORTH CRAFT」(オンラインストア NORTH CLOUT) のカスタマーサポート AI です。
- 国産素材の手仕事グッズ (木製カトラリー / アロマキャンドル / 美濃焼マグ / 近江リネン 等) を扱うショップ
- 敬語で丁寧に、300 文字以内で簡潔に回答する
- 商品の素材・お手入れ・送料・返品・ギフトラッピングなどの質問に答える
- 個人情報 (氏名 / 住所 / クレジット番号 / 電話番号) を求めない。求められても拒否する
- 価格や在庫について断定できないときは「商品ページをご確認ください」と案内する
- 分からない質問は「画面下のお問い合わせフォームから直接スタッフへ」と誘導する
- 政治・宗教・医療など店舗に関係ない話題は「商品に関するご質問にお答えしております」と丁重にお断りする`;

// 現在の AI バックエンドを判定する。
// - "openai"  AI_BACKEND=openai かつ OPENAI_API_KEY あり
// - "mock"    上記以外すべて
// AI_BACKEND 環境変数 (chapter 12-openai) によって明示的に切り替える設計。
export function resolveAiBackend(): "openai" | "mock" {
  const backend = process.env.AI_BACKEND ?? "mock";
  if (backend === "openai" && process.env.OPENAI_API_KEY) {
    return "openai";
  }
  return "mock";
}

/**
 * AI 応答を生成する。
 *
 * 完成形では次の挙動になる想定です。
 * - AI_BACKEND=openai かつ OPENAI_API_KEY あり  OpenAI Chat Completions API を呼ぶ
 * - 上記以外                                    dummy-responses からマッチング応答を返す
 *
 * 受講生がまず手を入れるのは「mock 分岐」だけで十分動きます。
 * Ch12 まで進んだら OpenAI 呼び出しを追加してください。
 */
async function generateMockReply(userMessage: string): Promise<string> {
  // 体感を実 API に近づけるため軽くウェイト
  await new Promise((resolve) => setTimeout(resolve, 300));
  return findDummyReply(userMessage);
}

async function generateOpenAIReply(history: ChatMessage[], userMessage: string): Promise<string> {
  // 動的 import で本番デプロイ時のみ openai SDK をロードする
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  // 直近 10 件のみ送ってトークン節約
  const recent = history.slice(-10);
  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...recent.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: userMessage },
  ];

  const completion = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    max_tokens: 400,
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("AI からの応答が空でした");
  }
  return text;
}

export async function generateReply(history: ChatMessage[], userMessage: string): Promise<string> {
  if (resolveAiBackend() === "mock") {
    return generateMockReply(userMessage);
  }

  // OpenAI 経路 — 失敗したら mock にフェイルセーフ
  try {
    return await generateOpenAIReply(history, userMessage);
  } catch (err) {
    console.error("[ai] OpenAI 呼び出しに失敗。mock 応答にフォールバック", err);
    return generateMockReply(userMessage);
  }
}
