interface ResetConfirmModalProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// Figma 仕様
// オーバーレイ (黒 50%)、中央 Modal (375x184)
// タイトル「会話履歴をリセットしますか？」
// 説明「現在の会話履歴が削除されます。」
// ボタン 左「閉じる」(グレー) / 右「リセットする」(緑)
export function ResetConfirmModal({ open, loading, onClose, onConfirm }: ResetConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[375px] rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="reset-modal-title" className="text-base font-bold text-ink">
          会話履歴をリセットしますか？
        </h2>
        <p className="mt-2 text-sm text-ink-sub">現在の会話履歴が削除されます。</p>
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink-sub transition hover:bg-surface-second disabled:opacity-50"
          >
            閉じる
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-60"
          >
            {loading ? "処理中..." : "リセットする"}
          </button>
        </div>
      </div>
    </div>
  );
}
