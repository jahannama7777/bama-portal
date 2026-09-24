"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Header from "../components/header/Header";
import AppCard from "../components/dashboard/AppCard";
import SidebarWidgets from "../components/dashboard/SidebarWidgets";
import LoginModal from "../components/auth/LoginModal";
import UserManagementModal from "../components/auth/UserManagementModal";
import AppEditModal from "@/src/components/widgets/AppEditModal";
import { Plus } from "lucide-react";
import { useApps } from "../context/AppsContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);

  const { apps = [], addApp, updateApp, deleteApp } = useApps();
  const { user, can, canAccessApp, isGuest } = useAuth();
  const { showToast } = useToast();

  const canManage = Boolean(can?.manageApps && can.manageApps(user));

  // کلید اختصاصی کش در مرورگر برای تفکیک چیدمان هر کاربر یا حالت مهمان
  const storageKey = user?.id
    ? `bama_app_order_u${user.id}`
    : "bama_app_order_guest";

  // آرایه شناسه آیکون‌ها برای مدیریت چیدمان Drag & Drop
  const [customOrder, setCustomOrder] = useState([]);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  // لود ترتیب ذخیره‌شده کاربر از localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCustomOrder(parsed);
          return;
        }
      }
    } catch {
      // نادیده‌گرفتن خطای ذخیره‌سازی محلی مرورگر
    }
    setCustomOrder([]);
  }, [storageKey]);

  useEffect(() => {
    console.log(
      "%c Jaber Bakrani ",
      "background: #000; color: #39ff14; font-size: 18px; font-weight: bold; padding: 6px 12px; border-radius: 6px;"
    );
    console.log(
      "%cDeveloper of Bama Portal",
      "color: #00bcd4; font-size: 13px; font-weight: bold;"
    );
  }, []);

  const handleDeleteApp = (id) => {
    const target = apps.find(
      (a) => a.id === id || String(a.id) === String(id)
    );
    deleteApp(id);
    showToast(
      `سامانه «${target?.titleFa || target?.title || "سامانه"}» حذف شد.`,
      "success"
    );
  };

  const handleAddNewApp = async () => {
    const newId = await addApp();
    if (newId) {
      const newApp = apps.find((a) => a.id === newId) || {
        id: newId,
        titleFa: "سامانه جدید",
        titleEn: "",
        url: "",
        desc: "",
        icon: "Globe",
      };
      setEditingApp(newApp);
    } else {
      showToast("خطا در ایجاد سامانه جدید. لطفاً دوباره تلاش کنید.", "error");
    }
  };

  // ۱. فیلتر سامانه‌ها بر اساس دسترسی نقش کاربر
  const accessibleApps = useMemo(() => {
    return (apps || []).filter((app) => {
      if (typeof canAccessApp === "function") {
        return canAccessApp(app);
      }
      return true;
    });
  }, [apps, canAccessApp]);

  // ۲. مرتب‌سازی سامانه‌های در دسترس طبق چیدمان درگ‌شده کاربر
  const orderedAccessibleApps = useMemo(() => {
    if (!customOrder || customOrder.length === 0) {
      return accessibleApps;
    }

    return [...accessibleApps].sort((a, b) => {
      const indexA = customOrder.indexOf(a.id);
      const indexB = customOrder.indexOf(b.id);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [accessibleApps, customOrder]);

  // ۳. فیلتر نهایی بر اساس متن جستجو
  const finalDisplayApps = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return orderedAccessibleApps;

    return orderedAccessibleApps.filter((app) => {
      return (
        app.titleFa?.toLowerCase().includes(term) ||
        app.titleEn?.toLowerCase().includes(term) ||
        app.title?.toLowerCase().includes(term) ||
        app.desc?.toLowerCase().includes(term)
      );
    });
  }, [orderedAccessibleApps, searchTerm]);

  // رویدادهای Drag & Drop
  const handleDragStart = (index) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (
      dragItem.current === null ||
      dragOverItem.current === null ||
      dragItem.current === dragOverItem.current
    ) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    // جابه‌جایی در لیست فعلی
    const nextList = [...finalDisplayApps];
    const draggedItem = nextList.splice(dragItem.current, 1)[0];
    nextList.splice(dragOverItem.current, 0, draggedItem);

    dragItem.current = null;
    dragOverItem.current = null;

    const newOrderIds = nextList.map((app) => app.id);
    setCustomOrder(newOrderIds);

    try {
      localStorage.setItem(storageKey, JSON.stringify(newOrderIds));
    } catch {
      // نادیده‌گرفتن خطای سهمیه دیسک مرورگر
    }
  };

  return (
    <div
      className="relative min-h-[100dvh] overflow-x-hidden flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 font-sans select-none text-slate-800 dark:text-slate-100 transition-colors duration-300"
      dir="rtl"
    >
      {/* پس‌زمینه: عکس صنعتی باما با لایه شیشه‌ای */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/mine.png"
          alt="بک‌گراند شرکت باما"
          fill
          priority
          className="object-cover object-center brightness-95 opacity-90 dark:brightness-75"
        />
        <div className="absolute inset-0 bg-linear-to-tr from-sky-100/50 via-white/30 to-slate-200/40 dark:from-slate-950/70 dark:via-slate-900/50 dark:to-slate-950/70" />
      </div>

      {/* کانتینر اصلی داشبورد (واکنش‌گرا برای ارتفاع موبایل با 92dvh) */}
      <div className="relative z-10 flex flex-col w-full max-w-7xl h-[92dvh] md:h-[85vh] bg-white/50 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/70 dark:border-white/10 p-3 md:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] overflow-hidden transition-all duration-300">
        <div className="flex-1 min-h-0 flex flex-col gap-2.5 md:gap-3">
          {/* هدر */}
          <div className="shrink-0">
            <Header
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onOpenLogin={() => setIsLoginOpen(true)}
              onOpenUserModal={() => setIsUserModalOpen(true)}
            />
          </div>

          {/* بدنه داشبورد: سایدبار در موبایل می‌رود پایین (order-2) و سامانه‌ها اولویت دید هستند (order-1) */}
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-2.5 md:gap-3 items-stretch overflow-hidden">
            
            {/* ستون سایدبار و ویجت‌ها */}
            <div className="w-full lg:w-72 shrink-0 h-auto lg:h-full min-h-0 flex flex-col order-2 lg:order-1">
              <SidebarWidgets appCount={finalDisplayApps.length} />
            </div>

            {/* محفظه نمایش کارت‌های سامانه‌ها */}
            <div className="flex-1 min-h-0 flex flex-col bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm rounded-xl md:rounded-2xl p-2.5 md:p-4 border border-white/30 dark:border-white/10 shadow-inner transition-colors duration-300 order-1 lg:order-2">
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
                {finalDisplayApps.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3 pb-2">
                    {finalDisplayApps.map((app, index) => (
                      <AppCard
                        key={app.id ?? `app-${index}`}
                        index={index}
                        {...app}
                        canManage={canManage}
                        onUpdate={(id) => {
                          const target = apps.find(
                            (a) => a.id === id || String(a.id) === String(id)
                          );
                          if (target) setEditingApp(target);
                        }}
                        onDelete={handleDeleteApp}
                        onDragStartItem={handleDragStart}
                        onDragEnterItem={handleDragEnter}
                        onDragEndItem={handleDragEnd}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center border border-dashed border-white/20 rounded-xl bg-black/20 backdrop-blur-sm">
                    <p className="text-xs text-slate-200">
                      {isGuest || !user
                        ? "برای مشاهده سامانه‌ها وارد حساب کاربری شوید."
                        : searchTerm
                        ? `سامانه‌ای با عنوان «${searchTerm}» پیدا نشد.`
                        : "سامانه‌ای برای نقش شما تعریف نشده است."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* دکمه شناور افزودن سامانه جدید */}
        {canManage && (
          <div className="absolute left-4 bottom-4 md:left-6 md:bottom-6 z-40 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-md opacity-50 group-hover:opacity-85 transition duration-500 group-hover:scale-110 pointer-events-none" />

            <button
              onClick={handleAddNewApp}
              type="button"
              className="animate-pulse relative flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-cyan-600/85 hover:bg-cyan-500 dark:bg-cyan-500/40 dark:hover:bg-cyan-500/60 backdrop-blur-xl border border-white/40 dark:border-cyan-300/40 text-white shadow-[0_8px_30px_rgb(0,0,0,0.25)] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Plus size={22} strokeWidth={2.5} />
            </button>

            <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-white/10 text-white text-xs font-bold whitespace-nowrap shadow-xl">
              افزودن سامانه جدید
            </div>
          </div>
        )}
      </div>

      {/* مدال‌ها */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />
      <AppEditModal
        isOpen={Boolean(editingApp)}
        appData={editingApp}
        onClose={() => setEditingApp(null)}
        onSave={(updatedData) => {
          updateApp(updatedData.id, updatedData);
          setEditingApp(null);
        }}
      />
    </div>
  );
}
