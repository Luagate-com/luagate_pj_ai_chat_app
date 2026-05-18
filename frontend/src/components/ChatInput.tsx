import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  disabled: boolean;
  onSubmit: (message: string) => void;
}

const MAX_LENGTH = 500;

// Figma 仕様
// - placeholder「気になることを聞いてみよう」
// - 最大 500 文字、右下に Counter (X/500)
// - 右上に送信ボタン (▶ アイコン)
// - 500 文字超で送信ボタン disabled + 「500文字以内で入力してください」エラー
export function ChatInput({ disabled, onSubmit }: ChatInputProps) {
  const [value, setValue] = useState("");

  const trimmed = value.trim();
  const length = value.length;
  const overLimit = length > MAX_LENGTH;
  const canSubmit = !disabled && !overLimit && trimmed.length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit(trimmed);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter で送信、Shift+Enter で改行
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="w-full">
      <div
        className={`relative rounded-2xl border bg-white shadow-sm transition ${
          overLimit ? "border-danger" : "border-line focus-within:border-brand"
        }`}
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="気になることを聞いてみよう"
          rows={2}
          aria-label="メッセージ入力"
          className="block w-full resize-none rounded-2xl bg-transparent px-4 py-3 pr-14 text-sm leading-relaxed text-ink placeholder:text-ink-disabled focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-label="送信"
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-white transition ${
            canSubmit ? "bg-brand hover:bg-brand-hover" : "bg-muted cursor-not-allowed"
          }`}
        >
          <Send size={16} strokeWidth={2.2} />
        </button>
        <div className="flex items-center justify-between px-4 pb-2 pt-0">
          <span className={`text-xs ${overLimit ? "text-danger" : "text-ink-sub"}`}>
            {overLimit ? "500文字以内で入力してください" : ""}
          </span>
          <span className={`text-xs tabular-nums ${overLimit ? "text-danger" : "text-ink-sub"}`}>
            {length}/{MAX_LENGTH}
          </span>
        </div>
      </div>
    </div>
  );
}
