// OpenAI 連携 or モック切替を行うモジュール。
//
// 学習チャプター
// - Ch12 (12-openai)         OpenAI Chat Completions API の呼び出し方
// - Ch13 (13-error-handling) AI 応答エラー時のフェイルセーフ実装
//
// 受講生が完成させる箇所には TODO を残しています。
// 完成版は main ブランチを参照してください。

import { findDummyReply } from "../data/dummy-responses.js";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// TODO Ch12-openai
// OpenAI 用のシステムプロンプトをここで定義する。
// ヒント
// - 「NORTH CRAFT」(オンラインストア NORTH CLOUT) のカスタマーサポート AI という役割を与える
// - 300 文字以内、敬語、個人情報を求めない、などのガードを書く
const SYSTEM_PROMPT = `TODO: 受講生は Ch12 でシステムプロンプトを定義する`;

/**
 * AI 応答を生成する。
 *
 * 完成形では次の挙動になる想定です。
 * - OPENAI_API_KEY が設定されている  OpenAI Chat Completions API を呼び出す
 * - 未設定                            dummy-responses からマッチング応答を返す
 *
 * 受講生がまず手を入れるのは「mock 分岐」だけで十分動きます。
 * Ch12 まで進んだら OpenAI 呼び出しを追加してください。
 */
export async function generateReply(history: ChatMessage[], userMessage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // TODO Ch10-history / Ch11-chat-ui
    // モック応答を返す。
    // ヒント
    // - 600ms ほど setTimeout で待ってから返すと、本物 API の体感に近づく
    // - findDummyReply(userMessage) を呼び出す
    await new Promise((resolve) => setTimeout(resolve, 300));
    return findDummyReply(userMessage);
  }

  // TODO Ch12-openai
  // OpenAI Chat Completions API を呼び出して応答を返す。
  // ヒント
  // - `const { default: OpenAI } = await import("openai");` で動的読み込み
  // - new OpenAI({ apiKey }) でクライアントを作る
  // - process.env.OPENAI_MODEL を読む。未設定なら "gpt-4o-mini"
  // - messages は [system, ...history, user] の順で組み立てる
  // - 直近 10 件だけ送る (history.slice(-10))
  // - temperature 0.7、max_tokens 400 あたりが教材で使った値
  // - completion.choices[0]?.message?.content?.trim() を返す
  // - 応答が空なら throw new Error("AI からの応答が空でした")
  void history;
  throw new Error("Not implemented yet — see chapter 12-openai");
}

// import 例 (Ch12 で使う)
// import OpenAI from "openai";
// 動的 import を使う場合は generateReply 内で `const { default: OpenAI } = await import("openai");`
