# LuaGate 実践開発プロジェクト③ — AI チャットアプリ

NORTH CRAFT / NORTH CLOUT (PJ#1 EC サイトのクライアント) のカスタマー AI チャットを題材に、外部 API 連携・ストリーミング・エラー処理を学ぶ実践プロジェクトです。

## 構成

```
luagate_pj_ai_chat_app/
├─ api/        # Express + TypeScript バックエンド
├─ frontend/   # Vite + React + TS + Tailwind フロント
└─ docs/       # 補助資料
```

## 動かし方

### 1. バックエンド

```bash
cd api
cp .env.example .env
# 必要なら OPENAI_API_KEY を設定する (未設定でもモック応答で動く)
npm install
npm run dev
# http://localhost:3031/api/health
```

### 2. フロントエンド

```bash
cd frontend
npm install
npm run dev
# http://localhost:5175
```

dev サーバーは `/api/*` を `http://localhost:3031` にプロキシします。

## AI バックエンドの切替

`api/.env` の `OPENAI_API_KEY` が設定されていれば OpenAI Chat Completions を呼び出します。未設定なら `api/src/data/dummy-responses.ts` のマッチング応答が返ります。教材としてキーなしでも動かせることを優先しています。

## エンドポイント

- `POST   /api/chat`           メッセージ送信 (body は `{ message: string }`)
- `DELETE /api/chat/history`   会話履歴リセット
- `GET    /api/chat/history`   履歴取得 (デバッグ用)
- `GET    /api/health`         ヘルスチェック

## 学習意図

- 外部 API (OpenAI) との連携設計
- フェイルセーフ (API キー未設定時のモック切替)
- 楽観的 UI 更新 + サーバー応答での同期
- フェードイン・点滅などの UI アニメーション
- Toast / Modal などの UX パターン

## デザイントークン

PJ#2 と共通の Figma 配色を使用しています (`tailwind.config.js` 参照)。

- brand `#05B45B`
- brand-light `rgba(5,180,91,0.1)`
- brand-dark `#037F40`
- ink `#363635` / ink-sub `#727270`
- surface `#FDFDFA` / surface-second `#F5F4ED`
- line `#DCDCD9`
- warning-light `#FFF9E6` / warning `#F2B705`
