import { Bot } from "lucide-react";

// 「回答を生成中...」アニメーション
// ドットが時間差で点滅する。1 秒ループ。
export function TypingIndicator() {
  return (
    <div className="flex w-full items-start gap-2">
      <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-light text-brand-dark">
        <Bot size={16} strokeWidth={2} />
      </div>
      <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-line bg-white px-4 py-3 text-sm text-ink-sub shadow-sm">
        <span>回答を生成中</span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-dot-blink rounded-full bg-brand" style={{ animationDelay: "0ms" }} />
          <span className="h-1.5 w-1.5 animate-dot-blink rounded-full bg-brand" style={{ animationDelay: "200ms" }} />
          <span className="h-1.5 w-1.5 animate-dot-blink rounded-full bg-brand" style={{ animationDelay: "400ms" }} />
        </span>
      </div>
    </div>
  );
}
