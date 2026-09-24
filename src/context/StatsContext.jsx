"use client";

/**
 * File: src/context/StatsContext.jsx
 *
 * همان باگ ناسازگاری تایپ Int/String که در سامانه‌ها بود، اینجا هم وجود داشت
 * و در عمل خطرناک‌تر بود:
 *
 *   DEFAULT_STATS = [{ id: "stat-1", ... }]     ← شناسه رشته‌ای ساختگی
 *
 * این رکوردها فقط یک placeholder نمایشی بودند و در دیتابیس وجود نداشتند، ولی
 * updateStat / deleteStat همین شناسه را مستقیم به API می‌فرستادند و آنجا
 * `Number("stat-1")` برابر NaN می‌شد →  prisma.stat.update({ where: { id: NaN } })
 * که با خطای 500 می‌افتاد و هیچ پیامی هم به کاربر نشان داده نمی‌شد.
 *
 * راه‌حل: placeholderها با پرچم isPlaceholder مشخص می‌شوند. ویرایش یک
 * placeholder به‌جای PATCH، یک رکورد واقعی در دیتابیس می‌سازد؛ حذف آن هم فقط
 * از state محلی انجام می‌شود و هیچ درخواستی به سرور نمی‌رود.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const StatsContext = createContext(null);

const DEFAULT_STATS = [
  { id: "stat-1", title: "سامانه فعال", value: "۱۷", icon: "LayoutGrid", isPlaceholder: true },
  { id: "stat-2", title: "پایداری شبکه", value: "۹۹.۹%", icon: "Activity", isPlaceholder: true },
  { id: "stat-3", title: "دسترسی سریع", value: "۲۴/۷", icon: "Zap", isPlaceholder: true },
];

/** شناسه واقعی دیتابیس (Int) یا null برای placeholderها */
function toStatId(value) {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? value : null;
  }
  const raw = String(value ?? "").trim();
  if (!/^\d+$/.test(raw)) return null; // "stat-1" → null
  const parsed = Number.parseInt(raw, 10);
  return parsed > 0 ? parsed : null;
}

export function StatsProvider({ children }) {
  const [stats, setStats] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const mapStat = useCallback((s) => {
    const realId = toStatId(s.id);
    const label = s.title || s.titleFa || s.label || "آمار";
    return {
      ...s,
      id: realId ?? s.id,
      title: label,
      titleFa: label,
      value: String(s.value ?? "۰"),
      isPlaceholder: realId === null,
    };
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setStats(data.map(mapStat));
          return;
        }
      }
      setStats(DEFAULT_STATS.map(mapStat));
    } catch (err) {
      console.error("Error fetching stats:", err);
      setStats(DEFAULT_STATS.map(mapStat));
    } finally {
      setIsLoaded(true);
    }
  }, [mapStat]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const addStat = useCallback(
    async (newStatData = {}) => {
      const payload = {
        title: newStatData.title || newStatData.titleFa || "آمار جدید",
        value: String(newStatData.value ?? "۰"),
        icon: newStatData.icon || "Activity",
      };

      try {
        const res = await fetch("/api/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) return { success: false };

        const created = await res.json();
        setStats((prev) => [...prev, mapStat(created)]);
        return { success: true, stat: created };
      } catch (err) {
        console.error("Failed to add stat:", err);
        return { success: false };
      }
    },
    [mapStat],
  );

  const updateStat = useCallback(
    async (targetId, updatedFields = {}) => {
      const realId = toStatId(targetId);
      const current = stats.find((s) => String(s.id) === String(targetId));

      // placeholder → به‌جای update، یک رکورد واقعی ساخته می‌شود
      if (realId === null) {
        const result = await addStat({ ...current, ...updatedFields });
        if (result.success) {
          setStats((prev) =>
            prev.filter((s) => String(s.id) !== String(targetId)),
          );
        }
        return result;
      }

      setStats((prev) =>
        prev.map((item) =>
          item.id === realId ? mapStat({ ...item, ...updatedFields, id: realId }) : item,
        ),
      );

      const payload = {
        id: realId,
        title:
          updatedFields.title || updatedFields.titleFa || current?.title || "آمار",
        value: String(updatedFields.value ?? current?.value ?? "۰"),
        icon: updatedFields.icon || current?.icon || "Activity",
        ...(updatedFields.order !== undefined
          ? { order: Number(updatedFields.order) }
          : {}),
      };

      try {
        const res = await fetch("/api/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          await fetchStats();
          return { success: false };
        }
        return { success: true };
      } catch (err) {
        console.error("Failed to update stat:", err);
        await fetchStats();
        return { success: false };
      }
    },
    [stats, mapStat, addStat, fetchStats],
  );

  const deleteStat = useCallback(async (targetId) => {
    const realId = toStatId(targetId);

    setStats((prev) => prev.filter((item) => String(item.id) !== String(targetId)));

    // placeholder فقط از state حذف می‌شود
    if (realId === null) return { success: true };

    try {
      const res = await fetch(`/api/stats?id=${realId}`, { method: "DELETE" });
      return { success: res.ok };
    } catch (err) {
      console.error("Failed to delete stat:", err);
      return { success: false };
    }
  }, []);

  const value = useMemo(
    () => ({ stats, addStat, updateStat, deleteStat, isLoaded, refreshStats: fetchStats }),
    [stats, addStat, updateStat, deleteStat, isLoaded, fetchStats],
  );

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
}

export const useStats = () =>
  useContext(StatsContext) || {
    stats: DEFAULT_STATS,
    addStat: async () => ({ success: false }),
    updateStat: async () => ({ success: false }),
    deleteStat: async () => ({ success: false }),
    isLoaded: true,
    refreshStats: async () => {},
  };

export default StatsContext;
