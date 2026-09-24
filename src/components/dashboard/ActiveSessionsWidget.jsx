"use client";

/**
 * File: src/components/dashboard/ActiveSessionsWidget.jsx
 */

import { useState, useEffect, useCallback } from "react";
import { Users, Monitor, LogOut, RefreshCw, ShieldCheck } from "lucide-react";

export default function ActiveSessionsWidget() {
  const [data, setData] = useState({ onlineUsersCount: 0, totalActiveSessions: 0, users: [] });
  const [loading, setLoading] = useState(true);
  const [terminatingId, setTerminatingId] = useState(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/active-sessions", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Error fetching sessions:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 20000); // هر ۲۰ ثانیه به‌روزرسانی زنده
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const handleKickUser = async (userId, userName) => {
    if (!confirm(`آیا از بستن تمام نشست‌های کاربر «${userName}» مطمئن هستید؟`)) return;
    setTerminatingId(userId);
    try {
      const res = await fetch(`/api/admin/active-sessions?userId=${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        await fetchSessions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTerminatingId(null);
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl text-slate-100 font-sans">
      {/* سربرگ */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">کاربران حاضر در سامانه</h3>
            <p className="text-xs text-slate-400">
              {data.onlineUsersCount} حساب کاربری ({data.totalActiveSessions} نشست باز)
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            fetchSessions();
          }}
          title="بروزرسانی لیست"
          className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 rounded-lg hover:bg-slate-800 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
        </button>
      </div>

      {/* لیست سشن‌ها */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {loading && data.users.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 animate-pulse">
            در حال بارگذاری وضعیت نشست‌ها...
          </div>
        ) : data.users.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            هیچ نشست فعالی در دیتابیس ثبت نشده است.
          </div>
        ) : (
          data.users.map(({ user, deviceCount }) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2.5 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 rounded-xl transition group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-slate-700/80 flex items-center justify-center font-bold text-xs text-slate-200">
                    {user.fullName ? user.fullName[0] : user.username[0].toUpperCase()}
                  </div>
                  {/* پالس سبز وضعیت آنلاین */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse"></span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{user.fullName || user.username}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {user.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{user.department || "فاقد واحد"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Monitor className="w-3 h-3 text-slate-500" />
                      {deviceCount} تب / دستگاه
                    </span>
                  </div>
                </div>
              </div>

              {/* دکمه اخراج / بستن سشن */}
              <button
                onClick={() => handleKickUser(user.id, user.fullName || user.username)}
                disabled={terminatingId === user.id}
                title="قطع دسترسی و خروج کاربر"
                className="opacity-0 group-hover:opacity-100 transition p-1.5 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg text-xs flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">اخراج</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
