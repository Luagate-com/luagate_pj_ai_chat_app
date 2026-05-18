import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { ToastItem } from "../types";

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

// Figma 仕様
// フェードイン 300ms → 4000ms 表示 → フェードアウト 300ms
export function Toast({ toast, onDismiss }: ToastProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setLeaving(true), 4000);
    const t2 = window.setTimeout(() => onDismiss(toast.id), 4300);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [toast.id, onDismiss]);

  const palette =
    toast.type === "error"
      ? { bg: "bg-warning-light", border: "border-warning", text: "text-ink", icon: "text-warning" }
      : toast.type === "success"
        ? { bg: "bg-brand-light", border: "border-brand", text: "text-brand-dark", icon: "text-brand" }
        : { bg: "bg-white", border: "border-line", text: "text-ink", icon: "text-ink-sub" };

  const Icon = toast.type === "error" ? AlertTriangle : toast.type === "success" ? CheckCircle2 : Info;

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${palette.bg} ${palette.border} ${palette.text} px-4 py-3 shadow-md ${
        leaving ? "animate-fade-out" : "animate-fade-in"
      }`}
    >
      <Icon size={18} className={`mt-0.5 flex-none ${palette.icon}`} strokeWidth={2} />
      <p className="text-sm leading-relaxed">{toast.message}</p>
    </div>
  );
}

interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
