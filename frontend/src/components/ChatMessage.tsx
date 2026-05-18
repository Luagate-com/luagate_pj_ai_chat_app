import { Bot } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "../types";

interface ChatMessageProps {
  message: ChatMessageType;
}

// Figma 仕様
// - assistant 左寄せ、白背景 + agent アイコン (緑円)
// - user 右寄せ、緑背景白文字
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex w-full justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-brand px-4 py-3 text-sm leading-relaxed text-white shadow-sm">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-start gap-2">
      <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-light text-brand-dark">
        <Bot size={16} strokeWidth={2} />
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-line bg-white px-4 py-3 text-sm leading-relaxed text-ink shadow-sm">
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}
