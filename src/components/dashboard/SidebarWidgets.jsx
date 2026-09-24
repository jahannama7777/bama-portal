"use client";

import React from 'react';
import NotificationWidget from '@/src/components/widgets/NotificationWidget';
import ActiveSessionsWidget from '@/src/components/dashboard/ActiveSessionsWidget';
import { useAuth } from '@/src/context/AuthContext';
import { Settings } from 'lucide-react';

export default function SidebarWidgets({ appCount = 0, canManage = true, onEditNotifications }) {
  const { user } = useAuth();
  
  // فقط در دسکتاپ ویجت جلسات فعال رو نمایش بده تا فضا برای موبایل باز بشه
  const isItAdmin = Boolean(user && (user.role === 'SUPERADMIN' || user.department?.toLowerCase() === 'it'));

  return (
    <div className="flex flex-col h-full min-h-0 gap-2">
      <div className="shrink-0 flex items-center justify-between px-1">
        <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200">
          سامانه‌ها ({appCount})
        </h2>
      </div>

      {/* مانیتورینگ: نمایش فقط در مانیتورهای بزرگ */}
      <div className="hidden lg:block shrink-0">
        {isItAdmin && <ActiveSessionsWidget />}
      </div>

      {/* ویجت اعلانات: در موبایل ارتفاع کمتری می‌گیرد */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto pr-1">
            <NotificationWidget canManage={canManage} />
        </div>
      </div>
    </div>
  );
}
