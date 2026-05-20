import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "../components/Header";
import { ChatMessage as ChatMessageView } from "../components/ChatMessage";
import { TypingIndicator } from "../components/TypingIndicator";
import { ChatInput } from "../components/ChatInput";
import { ToastStack } from "../components/Toast";
import { ResetConfirmModal } from "../components/ResetConfirmModal";
import { fetchHistory, resetHistory, sendChatMessage, formatApiError } from "../lib/api";
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const pushToast = useCallback((type: ToastItem["type"], message: string) => {
    setToasts((prev) => [...prev, { id: createToastId(), type, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Ch11-chat-ui: 初期ロードで GET /api/chat/history から履歴を取得
  useEffect(() => {
    fetchHistory()
      .then((res) => setMessages(res.history))
      .catch(() =>
        pushToast("error", "履歴の取得に失敗しました。ページを再読み込みしてください。")
      );
  }, [pushToast]);

  // Ch14-mobile-ui (前倒し): 末尾までスクロール
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  async function handleSubmit(message: string) {
    // 1) 楽観的に user メッセージを画面へ追加
    const optimistic: ChatMessage = {
      id: `local_${Date.now()}`,
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setSending(true);
    try {
      const res = await sendChatMessage(message);
      // サーバ側の正規履歴で上書き (id 付きの user + assistant が入った状態)
      setMessages(res.history);
    } catch (err) {
      pushToast("error", formatApiError(err));
      // 楽観追加した user を取り除く
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  }

  async function handleReset() {
    setResetting(true);
    try {
      const res = await resetHistory();
      setMessages(res.history);
      setResetOpen(false);
      pushToast("success", "会話履歴をリセットしました");
    } catch (err) {
      pushToast("error", formatApiError(err));
    } finally {
      setResetting(false);
    }
  }

  return (
    // Ch14-mobile-ui: dvh で iPhone Safari の URL バー伸縮にも追従
    <div className="flex h-dvh min-h-dvh flex-col bg-surface-second">
      <Header onOpenReset={() => setResetOpen(true)} />

      <main className="mx-auto flex w-full max-w-screen-md flex-1 flex-col px-4 pt-4">
        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-label="AI チャット会話履歴"
          className="flex flex-1 flex-col gap-3 overflow-y-auto pb-4"
        >
          {messages.map((m) => (
            <ChatMessageView key={m.id} message={m} />
          ))}
          {sending && <TypingIndicator />}
          {messages.length === 0 && !sending && (
            <div className="rounded-2xl border border-dashed border-line bg-white/70 p-6 text-center text-sm text-ink-sub">
              履歴を読み込んでいます...
            </div>
          )}
        </div>

        {/* Ch14-mobile-ui: 入力欄を画面下部に sticky + safe-area-inset でノッチ対応 */}
        <div className="sticky bottom-0 z-10 -mx-4 border-t border-line bg-surface-second/95 px-4 pb-safe pt-3 backdrop-blur">
          <ChatInput disabled={sending} onSubmit={handleSubmit} />
          <p className="mt-2 pb-2 text-center text-[11px] text-ink-sub">
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
