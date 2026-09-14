"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const addNotification = async (notifData) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifData),
      });
      if (res.ok) {
        const created = await res.json();
        setNotifications((prev) => [created, ...prev]);
        return created;
      }
    } catch (err) {
      console.error("Failed to add notification:", err);
    }
  };

  const updateNotification = async (id, fields) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...fields } : n))
    );

    const current = notifications.find((n) => n.id === id);
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...current, ...fields, id }),
      });
    } catch (err) {
      console.error("Failed to update notification:", err);
    }
  };

  const deleteNotification = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        updateNotification,
        deleteNotification,
        isLoaded,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
