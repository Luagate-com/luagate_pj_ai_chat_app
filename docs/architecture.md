# アーキテクチャ概要

## 全体像

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   ブラウザ   │  HTTP   │ Express API │  HTTP   │  OpenAI API │
│ (React + TS)│ ◀────▶  │  (Node 22)  │ ◀────▶  │   (任意)    │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              └─ OPENAI_API_KEY 未設定なら
                                 dummy-responses.ts のモック応答
```

## 主要モジュール

### バックエンド (`api/`)

- `src/index.ts` — Express エントリ。helmet/cors/json middleware と /api/health, /api/chat を設定
- `src/routes/chat.ts` — チャットルーター。インメモリで履歴を保持
- `src/lib/ai.ts` — OpenAI 呼び出し or モック切替の薄いラッパー
- `src/data/dummy-responses.ts` — OPENAI_API_KEY 未設定時のキーワードマッチング応答

### フロントエンド (`frontend/`)

- `src/pages/Chat.tsx` — メイン画面。履歴ロード・送信・リセットを統括
- `src/components/Header.tsx` — タイトル + 設定 (リセット) アイコン
- `src/components/ChatMessage.tsx` — ユーザー/AI 吹き出しの切替
- `src/components/TypingIndicator.tsx` — 「回答を生成中...」の点滅アニメーション
- `src/components/ChatInput.tsx` — 500 文字制限 + Counter + 送信ボタン
- `src/components/Toast.tsx` — フェードイン/アウト付き Snackbar
- `src/components/ResetConfirmModal.tsx` — リセット確認ダイアログ
- `src/lib/api.ts` — fetch ベースの API クライアント

## 履歴の保持

教材としてシンプルさを優先し、API プロセス全体で 1 セッションぶんの履歴をメモリに保持しています。受講生は「ユーザーごとの履歴を Redis や DB に持たせる」改修を後続課題として取り組めます。

## エラーハンドリングのレイヤー

1. **フロント側 zod 相当のバリデーション** — `ChatInput.tsx` で 500 文字超を即時 disabled
2. **API zod スキーマ** — 不正リクエストには 400 + メッセージを返す
3. **API グローバルエラーハンドラ** — 想定外のエラーは 500 +「ただいま回答できません。しばらくしてから再度お試しください」
4. **フロント Toast** — エラーをユーザーに通知 (フェードイン 300ms → 4000ms → フェードアウト 300ms)
