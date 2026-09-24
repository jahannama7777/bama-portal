"use client";

/**
 * File: src/context/AppsContext.jsx
 * مدیریت واکنش‌گرا و آنی وضعیت سامانه‌ها در فرانت‌اند
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AppsContext = createContext(null);

export function toAppId(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "object") {
    return toAppId(value.id ?? value.appId ?? null);
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : value;
}

export function AppsProvider({ children }) {
  const [apps, setApps] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  /** نرمال‌سازی داده سامانه برای استفاده در کارت‌ها و مودال‌ها */
  const mapAppData = useCallback((app) => {
    if (!app) return null;

    const displayTitle =
      app.titleFa || app.title || app.titleEn || "سامانه بدون عنوان";

    // مدیریت فیلد نقش‌ها چه به صورت آرایه و چه رشته JSON
    let parsedRoles = [];
    if (Array.isArray(app.roles)) {
      parsedRoles = app.roles;
    } else if (typeof app.roles === "string") {
      try {
        parsedRoles = JSON.parse(app.roles);
      } catch {
        parsedRoles = [];
      }
    }

    return {
      ...app,
      id: toAppId(app.id),
      titleFa: displayTitle,
      title: displayTitle,
      titleEn: app.titleEn || "",
      desc: app.desc || "",
      icon: app.icon || "Globe",
      color: app.color || "cyan",
      url: app.url || app.href || "#",
      href: app.url || app.href || "#",
      roles: parsedRoles,
      order: typeof app.order === "number" ? app.order : 0,
    };
  }, []);

  const fetchApps = useCallback(async () => {
    try {
      const res = await fetch("/api/apps", {
        cache: "no-store",
        credentials: "include",
      });

      if (res.ok) {
        const result = await res.json();
        const rawList = Array.isArray(result) ? result : (result.data || []);
        if (Array.isArray(rawList)) {
          setApps(rawList.map(mapAppData).filter((a) => a && a.id !== null));
        }
      }
    } catch (err) {
      console.error("Error fetching apps:", err);
    } finally {
      setIsLoaded(true);
    }
  }, [mapAppData]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  // ایجاد سامانه جدید و نشستن آنی در بالای لیست
  const addApp = useCallback(async () => {
    const newAppPayload = {
      titleFa: "سامانه جدید",
      titleEn: "New System",
      desc: "توضیح سامانه",
      icon: "Globe",
      color: "cyan",
      url: "#",
      roles: [],
      order: 0,
    };

    try {
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newAppPayload),
      });

      if (!res.ok) return null;

      const createdResponse = await res.json();
      const rawCreated = createdResponse.data || createdResponse;
      const formatted = mapAppData(rawCreated);

      if (formatted && formatted.id !== null) {
        setApps((prev) => [formatted, ...prev]);
        return formatted.id;
      }
      // در صورتی که سرور شیء را برنگرداند، واکشی مجدد خودکار
      await fetchApps();
      return true;
    } catch (err) {
      console.error("Error creating app:", err);
      return null;
    }
  }, [mapAppData, fetchApps]);

  // ویرایش سامانه با نشستن بلادرنگ (Optimistic)
  const updateApp = useCallback(
    async (rawId, fields = {}) => {
      const id = toAppId(rawId);
      if (id === null) return { success: false };

      // ۱. اعمال بلادرنگ روی رابط کاربری (بدون معطلی برای سرور)
      setApps((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          return mapAppData({ ...a, ...fields, id });
        })
      );

      const payload = {
        id,
        ...fields,
      };

      try {
        // مستقیماً ارسال متد POST که روت پروژه شما آن را دارد
        const res = await fetch("/api/apps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          // در صورت بروز خطای سمت سرور، بازگردانی داده قبلی
          await fetchApps();
          return { success: false };
        }

        const resData = await res.json();
        const updatedRecord = resData.data || (resData.id ? resData : null);
        if (updatedRecord) {
          setApps((prev) =>
            prev.map((a) => (a.id === id ? mapAppData(updatedRecord) : a))
          );
        }

        return { success: true };
      } catch (err) {
        console.error("Failed to sync app update:", err);
        await fetchApps();
        return { success: false };
      }
    },
    [mapAppData, fetchApps]
  );

  // حذف سامانه با حذف آنی از حافظه کلاینت
  const deleteApp = useCallback(
    async (rawId) => {
      const id = toAppId(rawId);
      if (id === null) return { success: false };

      // حذف سریع از State
      const snapshot = apps;
      setApps((prev) => prev.filter((a) => a.id !== id));

      try {
        const res = await fetch(`/api/apps?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!res.ok) {
          setApps(snapshot); // Rollback در صورت عدم دسترسی یا خطای سرور
          return { success: false };
        }
        return { success: true };
      } catch (err) {
        console.error("Failed to delete app:", err);
        setApps(snapshot);
        return { success: false };
      }
    },
    [apps]
  );

  const getAppById = useCallback(
    (rawId) => {
      const id = toAppId(rawId);
      return id === null ? undefined : apps.find((a) => a.id === id);
    },
    [apps]
  );

  const value = useMemo(
    () => ({
      apps,
      addApp,
      updateApp,
      deleteApp,
      getAppById,
      isLoaded,
      refreshApps: fetchApps,
    }),
    [apps, addApp, updateApp, deleteApp, getAppById, isLoaded, fetchApps]
  );

  return <AppsContext.Provider value={value}>{children}</AppsContext.Provider>;
}

export const useApps = () =>
  useContext(AppsContext) || {
    apps: [],
    addApp: async () => null,
    updateApp: async () => ({ success: false }),
    deleteApp: async () => ({ success: false }),
    getAppById: () => undefined,
    isLoaded: false,
    refreshApps: async () => {},
  };

export default AppsContext;
