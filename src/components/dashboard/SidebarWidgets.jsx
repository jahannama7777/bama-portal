"use client";

import React from 'react';
import NotificationWidget from '@/src/components/widgets/NotificationWidget';
import ActiveSessionsWidget from '@/src/components/dashboard/ActiveSessionsWidget';
import { useAuth } from '@/src/context/AuthContext';

/**
 * SidebarWidgets:
 * - مدیریت چیدمان سایدبار
 * - نمایش هوشمند ActiveSessionsWidget فقط برای IT Admin و در مانیتورهای بزرگ
 * - نمایش NotificationWidget به عنوان بخش اصلی سایدبار
 */
export default function SidebarWidgets({ appCount = 0, canManage = true }) {
  const { user } = useAuth();
  
  // فقط کاربرانی که نقش SUPERADMIN دارند یا در واحد IT هستند به ویجت نشست‌ها دسترسی دارند
  const isItAdmin = Boolean(user && (user.role === 'SUPERADMIN' || user.department?.toLowerCase() === 'it'));

  return (
    <div className="flex flex-col h-full min-h-0 gap-2">
      
      {/* هدر سایدبار */}
      <div className="shrink-0 flex items-center justify-between px-1">
        <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200">
          سامانه‌ها ({appCount})
        </h2>
      </div>

      {/* 
        مانیتورینگ نشست‌ها: 
        1. فقط برای IT Admin نمایش داده می‌شود
        2. کلاس hidden lg:block باعث می‌شود در موبایل و تبلت کاملاً مخفی شود 
        تا فضای نمایش برای کارت‌های سامانه و اعلان‌ها باز باشد.
      */}
      <div className="hidden lg:block shrink-0">
        {isItAdmin && <ActiveSessionsWidget />}
      </div>

      {/* ویجت اعلانات: در موبایل و دسکتاپ به عنوان بخش اصلی سایدبار نمایش داده می‌شود */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto pr-1 custom-scrollbar">
            <NotificationWidget canManage={canManage} />
        </div>
      </div>
      
    </div>
  );
}
