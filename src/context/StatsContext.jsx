"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const StatsContext = createContext();

const DEFAULT_STATS = [
  { id: "stat-1", title: "سامانه فعال", value: "۱۷", icon: "LayoutGrid" },
  { id: "stat-2", title: "پایداری شبکه", value: "۹۹.۹%", icon: "Activity" },
  { id: "stat-3", title: "دسترسی سریع", value: "۲۴/۷", icon: "Zap" },
];

export function StatsProvider({ children }) {
  const [stats, setStats] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // نرمال‌سازی: هر رکوردی که بیاید، title و titleFa هر دو پر می‌شوند
  const mapStat = (s) => ({
    ...s,
    title: s.title || s.titleFa || s.label || "آمار",
    titleFa: s.title || s.titleFa || s.label || "آمار",
  });

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setStats(data.map(mapStat));
          setIsLoaded(true);
          return;
        }
      }
      setStats(DEFAULT_STATS);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setStats(DEFAULT_STATS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // افزودن آمار جدید
  const addStat = async (newStatData = {}) => {
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
      if (res.ok) {
        const created = await res.json();
        setStats((prev) => [...prev, mapStat(created)]);
        return created;
      }
    } catch (err) {
      console.error("Failed to add stat:", err);
    }
  };

  // ویرایش آمار
  const updateStat = async (targetId, updatedFields) => {
    setStats((prev) =>
      prev.map((item) =>
        String(item.id) === String(targetId) ? mapStat({ ...item, ...updatedFields }) : item
      )
    );

    const currentStat = stats.find((s) => String(s.id) === String(targetId));
    const payload = {
      ...currentStat,
      ...updatedFields,
      id: targetId,
      title: updatedFields.title || updatedFields.titleFa || currentStat?.title,
    };

    try {
      await fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Failed to update stat:", err);
    }
  };

  // حذف آمار
  const deleteStat = async (targetId) => {
    setStats((prev) => prev.filter((item) => String(item.id) !== String(targetId)));
    try {
      await fetch(`/api/stats?id=${targetId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete stat:", err);
    }
  };

  return (
    <StatsContext.Provider
      value={{ stats, addStat, updateStat, deleteStat, isLoaded, refreshStats: fetchStats }}
    >
      {children}
    </StatsContext.Provider>
  );
}

export const useStats = () =>
  useContext(StatsContext) || {
    stats: DEFAULT_STATS,
    addStat: () => {},
    updateStat: () => {},
    deleteStat: () => {},
    isLoaded: true,
  };
