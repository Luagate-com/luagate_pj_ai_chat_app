import { Settings } from "lucide-react";

interface HeaderProps {
  onOpenReset: () => void;
}

// Figma 仕様
// 左 「NORTH CLOUT AI チャット」(緑チップ + テキスト)
// 右 設定アイコン (歯車)
export function Header({ onOpenReset }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-screen-md items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-brand-light px-2 py-1 text-xs font-semibold text-brand-dark">
            NORTH CLOUT
          </span>
          <span className="text-base font-semibold tracking-wide text-ink">AI チャット</span>
        </div>
        <button
          type="button"
          onClick={onOpenReset}
          aria-label="会話履歴をリセット"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-sub transition hover:bg-surface-second hover:text-ink"
        >
          <Settings size={18} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}
