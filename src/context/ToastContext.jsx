"use client";

/**
 * File: src/context/ToastContext.jsx
 *
 * سیستم توست بازنویسی‌شده:
 *  - پشتیبانی از انیمیشن خروج (toast ابتدا leaving می‌شود، بعد حذف)
 *  - مکث تایمر هنگام hover (pause / resume)
 *  - عنوان اختیاری، مدت‌زمان اختیاری، توست چسبان (duration: 0)
 *  - سقف تعداد توست هم‌زمان برای جلوگیری از پر شدن صفحه
 *  - API قدیمی showToast(message, type) کاملاً حفظ شده است
 *
 * نحوه استفاده:
 *   const { showToast, success, error } = useToast();
 *   showToast("ذخیره شد", "success");
 *   showToast({ title: "خطای شبکه", message: "دوباره تلاش کنید", type: "error" });
 *   error("حذف نشد", { title: "عملیات ناموفق", duration: 6000 });
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const ToastContext = createContext(null);

const DEFAULT_DURATION = 4000;
const EXIT_ANIMATION_MS = 320;
const MAX_TOASTS = 4;

const VALID_TYPES = ["success", "error", "warning", "info"];

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /** @type {React.MutableRefObject<Map<string, {timer: any, start: number, remaining: number, duration: number}>>} */
  const timersRef = useRef(new Map());
  const exitTimersRef = useRef(new Map());

  /** حذف فوری و بدون انیمیشن */
  const destroyToast = useCallback((id) => {
    const entry = timersRef.current.get(id);
    if (entry?.timer) clearTimeout(entry.timer);
    timersRef.current.delete(id);

    const exitTimer = exitTimersRef.current.get(id);
    if (exitTimer) clearTimeout(exitTimer);
    exitTimersRef.current.delete(id);

    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /** شروع خروج: ابتدا کلاس leaving، سپس حذف واقعی */
  const removeToast = useCallback(
    (id) => {
      const entry = timersRef.current.get(id);
      if (entry?.timer) clearTimeout(entry.timer);

      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
      );

      if (exitTimersRef.current.has(id)) return;

      const exitTimer = setTimeout(() => {
        destroyToast(id);
      }, EXIT_ANIMATION_MS);

      exitTimersRef.current.set(id, exitTimer);
    },
    [destroyToast],
  );

  /** زمان‌سنج بسته‌شدن خودکار */
  const scheduleClose = useCallback(
    (id, duration) => {
      if (!duration || duration <= 0) return; // توست چسبان
      const timer = setTimeout(() => removeToast(id), duration);
      timersRef.current.set(id, {
        timer,
        start: Date.now(),
        remaining: duration,
        duration,
      });
    },
    [removeToast],
  );

  const pauseToast = useCallback((id) => {
    const entry = timersRef.current.get(id);
    if (!entry?.timer) return;

    clearTimeout(entry.timer);
    const elapsed = Date.now() - entry.start;
    timersRef.current.set(id, {
      ...entry,
      timer: null,
      remaining: Math.max(entry.remaining - elapsed, 400),
    });
  }, []);

  const resumeToast = useCallback(
    (id) => {
      const entry = timersRef.current.get(id);
      if (!entry || entry.timer) return;

      const timer = setTimeout(() => removeToast(id), entry.remaining);
      timersRef.current.set(id, { ...entry, timer, start: Date.now() });
    },
    [removeToast],
  );

  /**
   * showToast("متن", "success")
   * showToast({ message, title, type, duration })
   */
  const showToast = useCallback(
    (input, maybeType = "info", options = {}) => {
      let message = "";
      let type = "info";
      let title;
      let duration = DEFAULT_DURATION;

      if (input && typeof input === "object") {
        message = input.message ?? input.text ?? "";
        type = input.type ?? "info";
        title = input.title;
        duration = input.duration ?? DEFAULT_DURATION;
      } else {
        message = input ?? "";
        type = maybeType || "info";
        title = options.title;
        duration = options.duration ?? DEFAULT_DURATION;
      }

      if (!message && !title) return null;
      if (!VALID_TYPES.includes(type)) type = "info";

      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      setToasts((prev) => {
        const next = [...prev, { id, message, title, type, duration, leaving: false }];
        // قدیمی‌ترها را کنار بگذار تا صفحه پر نشود
        if (next.length > MAX_TOASTS) {
          const overflow = next.slice(0, next.length - MAX_TOASTS);
          overflow.forEach((t) => {
            const entry = timersRef.current.get(t.id);
            if (entry?.timer) clearTimeout(entry.timer);
            timersRef.current.delete(t.id);
          });
          return next.slice(next.length - MAX_TOASTS);
        }
        return next;
      });

      scheduleClose(id, duration);
      return id;
    },
    [scheduleClose],
  );

  const clearToasts = useCallback(() => {
    timersRef.current.forEach((entry) => entry?.timer && clearTimeout(entry.timer));
    timersRef.current.clear();
    exitTimersRef.current.forEach((timer) => clearTimeout(timer));
    exitTimersRef.current.clear();
    setToasts([]);
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    const exitTimers = exitTimersRef.current;
    return () => {
      timers.forEach((entry) => entry?.timer && clearTimeout(entry.timer));
      timers.clear();
      exitTimers.forEach((timer) => clearTimeout(timer));
      exitTimers.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      addToast: showToast, // سازگاری با کد قدیمی
      removeToast,
      clearToasts,
      pauseToast,
      resumeToast,
      success: (message, options) => showToast(message, "success", options),
      error: (message, options) => showToast(message, "error", options),
      warning: (message, options) => showToast(message, "warning", options),
      info: (message, options) => showToast(message, "info", options),
    }),
    [toasts, showToast, removeToast, clearToasts, pauseToast, resumeToast],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast باید داخل <ToastProvider> استفاده شود.");
  }
  return context;
}

export default ToastContext;
