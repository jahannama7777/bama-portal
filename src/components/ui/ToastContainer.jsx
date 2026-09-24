"use client";

/**
 * File: src/components/ui/ToastContainer.jsx
 *
 * توست شیشه‌ای (Glassmorphism) متناسب با تم تاریک پورتال صنعتی/معدنی باما.
 *
 * مشخصات:
 *  - موقعیت: پایین-راست (RTL)، روی موبایل تمام‌عرض پایین صفحه
 *  - پس‌زمینه بلورین + حاشیه درخشان (glow) مخصوص هر نوع
 *  - آیکون‌های Lucide
 *  - نوار پیشرفت که زمان باقی‌مانده تا بسته شدن را نشان می‌دهد
 *  - مکث تایمر با hover، دکمه بستن صریح، انیمیشن نرم ورود/خروج
 *
 * رنگ‌بندی (دقیقاً طبق خواسته):
 *  success → emerald-500/20  +  border emerald-500/40
 *  error   → rose-500/20     +  border rose-500/40
 *  warning → amber-500/20    +  border amber-500/40
 *  info    → sky-500/20      +  border sky-500/40
 *
 * نکته Tailwind v4: کلاس‌ها باید رشته کامل و ثابت باشند، بنابراین از map
 * استفاده شده و هیچ کلاسی به‌صورت داینامیک ساخته نمی‌شود.
 *
 * پیش‌نیاز CSS: کلاس‌های toast-enter / toast-leave / toast-progress در
 * src/app/globals.css تعریف شده‌اند (فایل globals.css همین بسته).
 */

import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToast } from "@/src/context/ToastContext";

const TOAST_VARIANTS = {
  success: {
    Icon: CheckCircle2,
    shell:
      "bg-emerald-500/20 border-emerald-500/40 shadow-[0_8px_32px_-8px_rgba(16,185,129,0.45)]",
    glow: "bg-emerald-400/70 shadow-[0_0_14px_rgba(16,185,129,0.9)]",
    iconWrap: "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40",
    title: "text-emerald-100",
    body: "text-emerald-50/85",
    progress: "bg-emerald-400/80",
    close: "text-emerald-200/70 hover:text-emerald-50 hover:bg-emerald-500/20",
    defaultTitle: "انجام شد",
  },
  error: {
    Icon: XCircle,
    shell:
      "bg-rose-500/20 border-rose-500/40 shadow-[0_8px_32px_-8px_rgba(244,63,94,0.45)]",
    glow: "bg-rose-400/70 shadow-[0_0_14px_rgba(244,63,94,0.9)]",
    iconWrap: "bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/40",
    title: "text-rose-100",
    body: "text-rose-50/85",
    progress: "bg-rose-400/80",
    close: "text-rose-200/70 hover:text-rose-50 hover:bg-rose-500/20",
    defaultTitle: "خطا",
  },
  warning: {
    Icon: AlertTriangle,
    shell:
      "bg-amber-500/20 border-amber-500/40 shadow-[0_8px_32px_-8px_rgba(245,158,11,0.45)]",
    glow: "bg-amber-400/70 shadow-[0_0_14px_rgba(245,158,11,0.9)]",
    iconWrap: "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/40",
    title: "text-amber-100",
    body: "text-amber-50/85",
    progress: "bg-amber-400/80",
    close: "text-amber-200/70 hover:text-amber-50 hover:bg-amber-500/20",
    defaultTitle: "هشدار",
  },
  info: {
    Icon: Info,
    shell:
      "bg-sky-500/20 border-sky-500/40 shadow-[0_8px_32px_-8px_rgba(14,165,233,0.45)]",
    glow: "bg-sky-400/70 shadow-[0_0_14px_rgba(14,165,233,0.9)]",
    iconWrap: "bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/40",
    title: "text-sky-100",
    body: "text-sky-50/85",
    progress: "bg-sky-400/80",
    close: "text-sky-200/70 hover:text-sky-50 hover:bg-sky-500/20",
    defaultTitle: "اطلاع",
  },
};

function ToastItem({ toast, onClose, onPause, onResume }) {
  const variant = TOAST_VARIANTS[toast.type] || TOAST_VARIANTS.info;
  const { Icon } = variant;

  const heading = toast.title || (toast.message ? variant.defaultTitle : null);
  const body = toast.title ? toast.message : toast.message;
  const showBody = Boolean(body);

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      aria-live={toast.type === "error" ? "assertive" : "polite"}
      onMouseEnter={() => onPause(toast.id)}
      onMouseLeave={() => onResume(toast.id)}
      className={[
        "pointer-events-auto relative w-full overflow-hidden rounded-2xl border",
        "backdrop-blur-xl backdrop-saturate-150",
        "px-3.5 py-3 pl-10",
        variant.shell,
        toast.leaving ? "toast-leave" : "toast-enter",
      ].join(" ")}
    >
      {/* خط درخشان لبه راست (RTL) */}
      <span
        aria-hidden="true"
        className={`absolute right-0 top-3 bottom-3 w-[3px] rounded-full ${variant.glow}`}
      />

      {/* هایلایت شیشه‌ای بالای کارت */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-l from-transparent via-white/40 to-transparent"
      />

      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${variant.iconWrap}`}
        >
          <Icon size={17} strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          {heading && (
            <p className={`text-[13px] font-bold leading-5 ${variant.title}`}>
              {heading}
            </p>
          )}
          {showBody && (
            <p
              className={`mt-0.5 text-[12px] font-medium leading-5 break-words ${variant.body}`}
            >
              {body}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onClose(toast.id)}
        aria-label="بستن پیام"
        className={`absolute left-2.5 top-2.5 rounded-lg p-1.5 transition-colors ${variant.close}`}
      >
        <X size={14} strokeWidth={2.5} />
      </button>

      {toast.duration > 0 && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-white/10"
        >
          <span
            className={`toast-progress block h-full origin-right ${variant.progress}`}
            style={{ animationDuration: `${toast.duration}ms` }}
          />
        </span>
      )}
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast, pauseToast, resumeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      dir="rtl"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 bottom-3 z-[1000000] flex flex-col-reverse gap-2.5 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[22rem]"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={removeToast}
          onPause={pauseToast}
          onResume={resumeToast}
        />
      ))}
    </div>
  );
}
