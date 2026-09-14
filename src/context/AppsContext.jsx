"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AppsContext = createContext();

export function AppsProvider({ children }) {
  const [apps, setApps] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // نرمال‌سازی داده‌ها برای مصرف کامپوننت‌های فرانت‌اند
  const mapAppData = (app) => {
    const displayTitle = app.titleFa || app.title || app.titleEn || "سامانه بدون عنوان";
    return {
      ...app,
      titleFa: displayTitle,
      title: displayTitle, // ایجاد فیلد title همزمان جهت پشتیبانی کامپوننت AppCard
      url: app.url || app.href || "#",
    };
  };

  const fetchApps = useCallback(async () => {
    try {
      const res = await fetch("/api/apps", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const formattedApps = data.map(mapAppData);
          setApps(formattedApps);
        }
      }
    } catch (err) {
      console.error("Error fetching apps:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const addApp = async () => {
    const newAppPayload = {
      titleFa: "سامانه جدید",
      titleEn: "New System",
      desc: "توضیح کوتاه سامانه",
      icon: "Globe",
      url: "#",
    };

    try {
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAppPayload),
      });

      if (res.ok) {
        const created = await res.json();
        const formatted = mapAppData(created);
        setApps((prev) => [formatted, ...prev]);
        return created.id;
      }
    } catch (err) {
      console.error("Error creating app:", err);
    }
  };

  const updateApp = async (id, fields) => {
    // 1. به‌روزرسانی سریع State فرانت‌اند
    setApps((prev) =>
      prev.map((a) => (a.id === id ? mapAppData({ ...a, ...fields }) : a))
    );

    const currentApp = apps.find((a) => a.id === id);
    const updatedTitleFa = fields.titleFa || fields.title || currentApp?.titleFa || "سامانه بدون عنوان";

    // 2. آماده‌سازی داده برای دیتابیس (حذف فیلدهای اضافی مثل title که در اسکیما نیستند)
    const payload = {
      id,
      titleFa: updatedTitleFa,
      titleEn: fields.titleEn !== undefined ? fields.titleEn : currentApp?.titleEn,
      desc: fields.desc !== undefined ? fields.desc : currentApp?.desc,
      icon: fields.icon || currentApp?.icon || "Globe",
      url: fields.url || fields.href || currentApp?.url || "#",
    };

    try {
      await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Failed to sync app update:", err);
    }
  };

  const deleteApp = async (id) => {
    setApps((prev) => prev.filter((a) => a.id !== id));
    try {
      await fetch(`/api/apps?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete app:", err);
    }
  };

  return (
    <AppsContext.Provider
      value={{
        apps,
        addApp,
        updateApp,
        deleteApp,
        isLoaded,
        refreshApps: fetchApps,
      }}
    >
      {children}
    </AppsContext.Provider>
  );
}

export const useApps = () => useContext(AppsContext);
