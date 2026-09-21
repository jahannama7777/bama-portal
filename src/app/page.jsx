"use client";

import { useState, useEffect } from "react";
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
  const canManage = can.manageApps(user);

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
    const target = apps.find((a) => a.id === id || String(a.id) === String(id));
    deleteApp(id);
    showToast(
      `سامانه «${target?.titleFa || target?.title || "سامانه"}» حذف شد.`,
      "success",
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

  // فیلتر بر اساس نقش + جستجو (GUEST / بدون لاگین → بدون سامانه)
  const filteredApps = (apps || []).filter((app) => {
    if (!canAccessApp(app)) return false;

    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    return (
      app.titleFa?.toLowerCase().includes(term) ||
      app.titleEn?.toLowerCase().includes(term) ||
      app.desc?.toLowerCase().includes(term)
    );
  });

  return (
    <div
      className="relative min-h-screen overflow-x-hidden flex items-center justify-center p-3 md:p-6 lg:p-8 font-sans select-none text-slate-800 dark:text-slate-100 transition-colors duration-300"
      dir="rtl"
    >
      {/* پس‌زمینه: عکس واضح با افکت تاریک‌کننده ملایم */}
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

      {/* کانتینر اصلی داشبورد */}
      <div className="relative z-10 flex flex-col w-full max-w-345 min-h-125 max-h-[85vh] bg-white/50 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/70 dark:border-white/10 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] overflow-hidden transition-all duration-300">

        <div className="flex-1 min-h-0 flex flex-col gap-3">
          {/* هدر */}
          <div className="shrink-0">
            <Header
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onOpenLogin={() => setIsLoginOpen(true)}
              onOpenUserModal={() => setIsUserModalOpen(true)}
            />
          </div>

          {/* بدنه داشبورد */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch overflow-hidden">
            {/* ستون سایدبار */}
            <div className="lg:col-span-3 h-full min-h-0 flex flex-col">
              <SidebarWidgets appCount={filteredApps.length} />
            </div>

            {/* محفظه نمایش کارت‌های سامانه‌ها: شفاف و شیشه‌ای */}
            <div className="lg:col-span-9 flex flex-col h-full min-h-0 bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-inner transition-colors duration-300">

              {/* گرید سامانه‌ها */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
                {filteredApps.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-2">
                    {filteredApps.map((app, index) => (
                      <AppCard
                        key={app.id ?? `app-${index}`}
                        {...app}
                        canManage={canManage}
                        onUpdate={(id) => {
                          const target = apps.find(
                            (a) => a.id === id || String(a.id) === String(id)
                          );
                          if (target) setEditingApp(target);
                        }}
                        onDelete={handleDeleteApp}
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

        {/* دکمه شناور افزودن سامانه */}
        {canManage && (
          <div className="absolute left-6 bottom-6 z-40 group">
            <div className="absolute -inset-1 bg-linear-to-r from-cyan-500 to-blue-600 rounded-full blur-md opacity-50 group-hover:opacity-85 transition duration-500 group-hover:scale-110 pointer-events-none" />

            <button
              onClick={handleAddNewApp}
              type="button"
              className="animate-pulse relative flex items-center justify-center w-12 h-12 rounded-full bg-cyan-600/85 hover:bg-cyan-500 dark:bg-cyan-500/40 dark:hover:bg-cyan-500/60 backdrop-blur-xl border border-white/40 dark:border-cyan-300/40 text-white shadow-[0_8px_30px_rgb(0,0,0,0.25)] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Plus
                size={24}
                strokeWidth={2.5}
              />
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