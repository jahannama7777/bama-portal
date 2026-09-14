'use client';

import React from 'react';
import NotificationWidget from '@/src/components/widgets/NotificationWidget';
import { Settings, Plus } from 'lucide-react';

export default function SidebarWidgets({
  appCount = 0,
  canManage = true, // دسترسی به ویرایش/مدیریت
  onEditNotifications,
  onAddNewApp,
}) {
  return (
    <div className="flex flex-col h-full min-h-0 gap-3">
      {/* هدر سایدبار همراه با شمارنده و دکمه‌های کنترلی/ویرایش */}
      <div className="shrink-0 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200">
            سامانه‌های فعال
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/20">
            {appCount} مورد
          </span>

          {/* دکمه تنظیمات/ویرایش اعلانات (در صورت داشتن دسترسی) */}
          {canManage && onEditNotifications && (
            <button
              type="button"
              onClick={onEditNotifications}
              className="p-1 rounded-lg bg-slate-200/60 dark:bg-white/10 hover:bg-cyan-500/20 text-slate-600 dark:text-slate-300 hover:text-cyan-500 transition-colors"
              title="مدیریت اعلانات"
            >
              <Settings size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ویجت اعلانات همراه با ارسال دسترسی canManage */}
      <div className="flex-1 min-h-0">
        <NotificationWidget canManage={canManage} />
      </div>
    </div>
  );
}
