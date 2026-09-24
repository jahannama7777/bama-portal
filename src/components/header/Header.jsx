"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  CloudSun,
  CloudRain,
  Sun,
  Cloud,
  CloudSnow,
  CloudLightning,
  Clock,
  Moon,
  User,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Users,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import UserManagementModal from "../auth/UserManagementModal";

// مختصات جغرافیایی منطقه معدن باما
const LATITUDE = 32.51;
const LONGITUDE = 51.52;

export default function Header({
  searchTerm,
  setSearchTerm,
  onOpenLogin,
  onOpenUserModal,
}) {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const authContext = useAuth?.() || {};
  const { user = null, logout = () => {}, can } = authContext;
  const { showToast } = useToast();

  const canManageUsers = can?.manageUsers?.(user) ?? false;

  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [weather, setWeather] = useState({
    temp: "--",
    condition: "در حال دریافت...",
    icon: "sun",
  });

  // مدیریت زمان و تاریخ شمسی
  useEffect(() => {
    setMounted(true);
    const checkInitialTheme = () => {
      if (typeof document !== "undefined") {
        setIsDark(document.documentElement.classList.contains("dark"));
      }
    };
    checkInitialTheme();

    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("fa-IR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
      setDateStr(
        now.toLocaleDateString("fa-IR", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // دریافت آب و هوا
  useEffect(() => {
    async function fetchWeather() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current_weather=true&timezone=Asia%2FTehran`;
        const res = await fetch(url);
        const data = await res.json();

        if (data?.current_weather) {
          const temp = Math.round(data.current_weather.temperature);
          const code = data.current_weather.weathercode;
          let condition = "آفتابی";
          let icon = "sun";
          if (code === 0) {
            condition = "صاف و آفتابی";
            icon = "sun";
          } else if (code >= 1 && code <= 3) {
            condition = "نیمه‌ابری";
            icon = "cloud-sun";
          } else if (code >= 45 && code <= 48) {
            condition = "مه‌آلود";
            icon = "cloud";
          } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
            condition = "بارانی";
            icon = "rain";
          } else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
            condition = "برفی";
            icon = "snow";
          } else if (code >= 95 && code <= 99) {
            condition = "رعد و برق";
            icon = "thunder";
          }
          setWeather({ temp: `${temp}°C`, condition, icon });
        }
      } catch {
        setWeather({ temp: "--", condition: "عدم ارتباط", icon: "cloud" });
      }
    }
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const renderWeatherIcon = () => {
    switch (weather.icon) {
      case "rain":
        return <CloudRain size={15} className="text-cyan-400" />;
      case "snow":
        return <CloudSnow size={15} className="text-sky-300" />;
      case "thunder":
        return <CloudLightning size={15} className="text-amber-400" />;
      case "cloud-sun":
        return <CloudSun size={15} className="text-amber-400" />;
      case "cloud":
        return <Cloud size={15} className="text-slate-400" />;
      default:
        return <Sun size={15} className="text-amber-400" />;
    }
  };

  const toggleTheme = () => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.classList.toggle("dark");
      setIsDark(root.classList.contains("dark"));
    }
  };

  const getRoleConfig = (role) => {
    switch (role) {
      case "SUPERADMIN":
        return {
          title: "مدیر ارشد",
          icon: ShieldAlert,
          badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
          avatarGradient: "from-rose-500 via-pink-600 to-amber-500",
        };
      case "ADMIN":
        return {
          title: "مدیر سیستم",
          icon: ShieldCheck,
          badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
          avatarGradient: "from-blue-500 via-indigo-600 to-cyan-500",
        };
      case "SUPERVISOR":
        return {
          title: "سرپرست",
          icon: ShieldCheck,
          badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
          avatarGradient: "from-amber-500 via-orange-600 to-yellow-500",
        };
      case "GUEST":
        return {
          title: "میهمان",
          icon: Shield,
          badgeColor: "text-slate-400 bg-slate-500/10 border-slate-500/20",
          avatarGradient: "from-slate-500 via-zinc-600 to-stone-600",
        };
      case "USER":
      default:
        return {
          title: "پرسنل",
          icon: Shield,
          badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
          avatarGradient: "from-cyan-500 via-blue-600 to-indigo-600",
        };
    }
  };

  const roleConfig = user ? getRoleConfig(user.role) : null;
  const RoleIcon = roleConfig?.icon || User;

  const handleOpenUserManagement = () => {
    if (onOpenUserModal) {
      onOpenUserModal();
    } else {
      setIsUserModalOpen(true);
    }
  };

  return (
    <>
      <header className="shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* لوگو و نام پورتال */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white shadow-xs border border-slate-200/50 p-1 flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.png"
                alt="لوگوی باما"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight select-none">
                <span className="text-[#0284c7] dark:text-[#38bdf8] drop-shadow-[0_1px_2px_rgba(2,132,199,0.15)]">
                باما
                </span>
                <span className="text-slate-900 dark:text-white mr-px">
                  پورتال
                </span>
              </h1>
              <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
                پیشخوان خدمات سازمانی
              </p>
            </div>
          </div>

          {/* نوار جستجو (واکنش‌گرا برای اندازه کلاینت) */}
          <div className="flex-1 max-w-35 xs:max-w-[200px] sm:max-w-xs md:max-w-sm mx-1 sm:mx-2">
            <div className="relative flex items-center group">
              <Search
                size={14}
                className="absolute right-2.5 sm:right-3.5 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو سامانه‌ها..."
                className="w-full pr-8 sm:pr-10 pl-2.5 sm:pl-4 py-1.5 sm:py-2 text-[11px] sm:text-xs rounded-xl bg-white/60 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/10 outline-none focus:ring-2 focus:ring-cyan-500/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all"
              />
            </div>
          </div>

          {/* ویجت ساعت و آب‌وهوا (در دسکتاپ و نمایشگرهای متوسط به بالا) */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/10">
              <Clock size={13} className="text-cyan-500" />
              <div className="flex flex-col leading-tight text-right">
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                  {mounted ? time : "--:--"}
                </span>
                <span className="text-[8px] text-slate-500 dark:text-slate-400">
                  {mounted ? dateStr : ""}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/10">
              {renderWeatherIcon()}
              <div className="flex flex-col leading-tight text-right">
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">
                  {weather.temp}
                </span>
                <span className="text-[8px] text-slate-500 dark:text-slate-400">
                  {weather.condition}
                </span>
              </div>
            </div>
          </div>

          {/* ابزارهای کاربر و دکمه‌ها */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* دکمه تم */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-xl bg-white/50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 transition-transform"
              title={isDark ? "تم روشن" : "تم تاریک"}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* دکمه مدیریت کاربران */}
            {canManageUsers && (
              <button
                onClick={handleOpenUserManagement}
                className="p-1.5 sm:p-2 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 hover:scale-105 active:scale-95 transition-transform"
                title="مدیریت دسترسی و کاربران"
              >
                <Users size={15} />
              </button>
            )}

            {/* بخش لاگین / پروفایل کاربر */}
            {user ? (
              <div className="flex items-center p-0.5 sm:p-1 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-lg">
                <div className="flex items-center gap-1.5 sm:gap-2 px-1 sm:px-2 py-0.5">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-linear-to-tr ${roleConfig?.avatarGradient} flex items-center justify-center text-white text-[11px] sm:text-xs font-black shadow-xs`}
                    title={user.fullName}
                  >
                    {user.fullName?.charAt(0) || <User size={13} />}
                  </div>
                  {/* نام و نقش تنها در صفحات md به بالا نمایش داده می‌شود */}
                  <div className="hidden sm:flex flex-col text-right leading-tight">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-22.5 md:max-w-30">
                      {user.fullName}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] px-1 rounded border ${roleConfig?.badgeColor}`}
                    >
                      <RoleIcon size={9} /> {roleConfig?.title}
                    </span>
                  </div>
                </div>

                <div className="h-4 sm:h-5 w-px bg-slate-200 dark:bg-white/10 mx-0.5" />

                <button
                  onClick={async () => {
                    await logout();
                    showToast("با موفقیت از حساب خارج شدید.", "success");
                  }}
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-400 hover:text-rose-500 active:scale-90 transition-all"
                  title="خروج از حساب"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 active:scale-95 transition-all shadow-sm shadow-cyan-600/20"
              >
                ورود
              </button>
            )}
          </div>
        </div>
      </header>

      {/* مودال مدیریت کاربران */}
      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />
    </>
  );
}
