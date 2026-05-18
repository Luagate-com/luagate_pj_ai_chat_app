import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "../components/Header";
import { ChatMessage as ChatMessageView } from "../components/ChatMessage";
import { TypingIndicator } from "../components/TypingIndicator";
import { ChatInput } from "../components/ChatInput";
import { ToastStack } from "../components/Toast";
import { ResetConfirmModal } from "../components/ResetConfirmModal";
import { fetchHistory, resetHistory, sendChatMessage, formatApiError } from "../lib/api";
import type { ChatMessage, ToastItem } from "../types";

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

  // 初期ロードで履歴を取得
  useEffect(() => {
    fetchHistory()
      .then((res) => setMessages(res.history))
      .catch(() => {
        pushToast("error", "履歴の取得に失敗しました。ページを再読み込みしてください。");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // メッセージ追加時にスクロール
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, sending]);

  const pushToast = useCallback((type: ToastItem["type"], message: string) => {
    setToasts((prev) => [...prev, { id: createToastId(), type, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  async function handleSubmit(message: string) {
    // 楽観的にユーザーメッセージを表示
    const tempUser: ChatMessage = {
      id: `tmp_${Date.now()}`,
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUser]);
    setSending(true);

    try {
      const res = await sendChatMessage(message);
      // サーバー側の正規な履歴で上書き (ID も正しい状態に揃える)
      setMessages(res.history);
    } catch (err) {
      // ユーザーメッセージは UI に残しつつエラー通知
      pushToast("error", formatApiError(err));
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
    <div className="flex h-full min-h-screen flex-col bg-surface-second">
      <Header onOpenReset={() => setResetOpen(true)} />

      <main className="mx-auto flex w-full max-w-screen-md flex-1 flex-col px-4 pb-4 pt-4">
        <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto pb-4">
          {messages.map((m) => (
            <ChatMessageView key={m.id} message={m} />
          ))}
          {sending && <TypingIndicator />}
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
