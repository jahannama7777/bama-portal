"use client";

import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { useToast } from "@/src/context/ToastContext";

const TOAST_STYLES = {
  error: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  info: "bg-slate-800/90 border-slate-700 text-slate-200",
};

function ToastIcon({ type }) {
  if (type === "error") return <AlertCircle size={18} />;
  if (type === "success") return <CheckCircle size={18} />;
  if (type === "warning") return <AlertTriangle size={18} />;
  return <Info size={18} />;
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      dir="rtl"
      className="pointer-events-none fixed top-5 right-5 z-[1000000] flex max-w-[min(92vw,24rem)] flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md animate-in slide-in-from-right-4 fade-in duration-300 ${
            TOAST_STYLES[toast.type] || TOAST_STYLES.info
          }`}
        >
          <ToastIcon type={toast.type} />
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="opacity-60 transition-opacity hover:opacity-100"
            aria-label="بستن پیام"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
