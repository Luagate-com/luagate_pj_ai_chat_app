import { useCallback, useRef, useState } from "react";
// useEffect は Ch11-chat-ui で履歴取得用に追加する。
// import { useEffect } from "react";
import { Header } from "../components/Header";
import { ChatMessage as ChatMessageView } from "../components/ChatMessage";
import { TypingIndicator } from "../components/TypingIndicator";
import { ChatInput } from "../components/ChatInput";
import { ToastStack } from "../components/Toast";
import { ResetConfirmModal } from "../components/ResetConfirmModal";
// 完成版で使う API クライアント (Ch11 / Ch13 で接続する)
// import { fetchHistory, resetHistory, sendChatMessage, formatApiError } from "../lib/api";
import type { ChatMessage, ToastItem } from "../types";

// 学習チャプター
// - Ch11 (11-chat-ui)        メッセージ表示 + 送信 + 楽観的更新
// - Ch13 (13-error-handling) エラー Toast、Reset Modal
// - Ch14 (14-mobile-ui)      dvh、スクロール挙動、モバイル仕上げ
//
// この Chat ページは starter スケルトンです。
// `useState` で空配列を持ち、TODO を埋めると完成版と同じ挙動になります。

function createToastId() {
  return `toast_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function Chat() {
  // TODO Ch11-chat-ui
  // messages 状態を fetchHistory() で初期化する。
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // TODO Ch11-chat-ui
  // 初期ロードで `GET /api/chat/history` から履歴を取得し setMessages する。
  // 失敗時は Toast でエラー通知する (Ch13)。
  // useEffect(() => {
  //   fetchHistory()
  //     .then((res) => setMessages(res.history))
  //     .catch(() => pushToast("error", "履歴の取得に失敗しました。ページを再読み込みしてください。"));
  // }, []);

  // TODO Ch14-mobile-ui
  // メッセージ追加時に末尾までスクロールする。
  // useEffect(() => {
  //   scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  // }, [messages, sending]);

  const pushToast = useCallback((type: ToastItem["type"], message: string) => {
    setToasts((prev) => [...prev, { id: createToastId(), type, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  async function handleSubmit(message: string) {
    // TODO Ch11-chat-ui / Ch13-error-handling
    // 1. ユーザーメッセージを楽観的に画面へ追加 (setMessages)
    // 2. setSending(true)
    // 3. sendChatMessage(message) を呼び、戻り値 res.history で setMessages を上書き
    // 4. エラー時は pushToast("error", formatApiError(err))
    // 5. finally で setSending(false)
    void message;
    void setMessages;
    void setSending;
    void pushToast;
    pushToast("info", "TODO Ch11-chat-ui — メッセージ送信を実装してください");
  }

  async function handleReset() {
    // TODO Ch13-error-handling
    // 1. setResetting(true)
    // 2. resetHistory() を呼び、戻り値 res.history で setMessages
    // 3. 成功時は setResetOpen(false) + pushToast("success", "会話履歴をリセットしました")
    // 4. 失敗時は pushToast("error", formatApiError(err))
    // 5. finally で setResetting(false)
    setResetting(true);
    setTimeout(() => {
      setResetting(false);
      setResetOpen(false);
      pushToast("info", "TODO Ch13-error-handling — リセットを実装してください");
    }, 300);
  }

  return (
    <div className="flex h-full min-h-screen flex-col bg-surface-second">
      <Header onOpenReset={() => setResetOpen(true)} />

      <main className="mx-auto flex w-full max-w-screen-md flex-1 flex-col px-4 pb-4 pt-4">
        <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto pb-4">
          {messages.map((m) => (
            <ChatMessageView key={m.id} message={m} />
          ))}
          {sending && <TypingIndicator />}
          {messages.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line bg-white/70 p-6 text-center text-sm text-ink-sub">
              TODO Ch11-chat-ui — 履歴取得とメッセージ送信を実装すると、ここに会話が表示されます。
            </div>
          )}
        </div>

        <div className="mt-2">
          <ChatInput disabled={sending} onSubmit={handleSubmit} />
          <p className="mt-2 text-center text-[11px] text-ink-sub">
            AIによる自動応答です。個人情報の入力はお控えください。
          </p>
        </div>
      </main>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <ResetConfirmModal
        open={resetOpen}
        loading={resetting}
        onClose={() => (resetting ? null : setResetOpen(false))}
        onConfirm={handleReset}
      />
    </div>
  );
}
