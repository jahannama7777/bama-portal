'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Search,
  CloudSun,
  CloudRain,
  Sun,
  Cloud,
  Calendar,
  Clock,
  Moon,
  ShieldCheck,
  User,
  LogOut,
  LogIn,
  UserPlus,
  X
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';

export default function Header({
  searchTerm = '',
  setSearchTerm = () => {},
  onOpenLogin = () => {},
  onOpenUserModal = () => {}
}) {
  const { user, logout, isSuperAdmin, isAdmin } = useAuth();
  const [time, setTime] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isDark, setIsDark] = useState(true);

  const [weather, setWeather] = useState({
    temp: '--',
    condition: 'دریافت وضعیت...',
    icon: 'sun'
  });

  // ساعت و تقویم شمسی زنده (جلوگیری از خطای Hydration)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
      setDateStr(
        now.toLocaleDateString('fa-IR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // دریافت اطلاعات آب و هوا بر اساس موقعیت جغرافیایی شرکت باما (ایرانکوه اصفهان)
  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=32.51&longitude=51.52&current_weather=true'
        );
        const data = await res.json();

        if (data && data.current_weather) {
          const temp = Math.round(data.current_weather.temperature);
          const code = data.current_weather.weathercode;

          let condition = 'آفتابی';
          let icon = 'sun';

          if (code >= 1 && code <= 3) {
            condition = 'نیمه‌ابری';
            icon = 'cloud-sun';
          } else if (code >= 45 && code <= 48) {
            condition = 'مه‌آلود';
            icon = 'cloud';
          } else if (code >= 51 && code <= 82) {
            condition = 'بارانی';
            icon = 'rain';
          }

          setWeather({
            temp: `${temp}°C`,
            condition,
            icon
          });
        }
      } catch {
        setWeather({
          temp: '۲۲°C',
          condition: 'صاف',
          icon: 'sun'
        });
      }
    }

    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, []);

  const renderWeatherIcon = () => {
    switch (weather.icon) {
      case 'rain':
        return <CloudRain size={18} className="text-cyan-400 animate-pulse" />;
      case 'cloud-sun':
        return <CloudSun size={18} className="text-amber-400" />;
      case 'cloud':
        return <Cloud size={18} className="text-slate-400" />;
      default:
        return <Sun size={18} className="text-amber-500 animate-[spin_12s_linear_infinite]" />;
    }
  };

  const toggleTheme = () => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark');
      setIsDark(!isDark);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'SUPERADMIN':
        return <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">مدیر ارشد</span>;
      case 'ADMIN':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">ادمین سیستم</span>;
      default:
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">کاربر سازمانی</span>;
    }
  };

  return (
    <header className="w-full bg-white/80 dark:bg-[#0b1120]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-40 px-4 md:px-8 py-3 transition-colors duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* ۱. سمت راست: لوگوی شرکت باما و عنوان پورتال */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center p-1.5 overflow-hidden">
            <Image
              src="/logo.png"
              alt="لوگوی شرکت باما"
              width={42}
              height={42}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              شرکت معدنی باما
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                پورتال ۱۷ سامانه
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              پیشخوان دسترسی یکپارچه به سامانه‌ها و خدمات سازمانی
            </p>
          </div>
        </div>

        {/* ۲. وسط: سرچ‌باکس متمرکز هدر با اکشن پاکسازی سریع */}
        <div className="flex-1 max-w-xl mx-auto w-full">
          <div className="relative group">
            <Search
              size={17}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو در بین ۱۷ سامانه (نام فارسی، انگلیسی یا توضیحات)..."
              className="w-full bg-slate-100 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 text-xs md:text-sm rounded-xl pr-10 pl-9 py-2.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="پاک کردن"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ۳. سمت چپ: آب‌وهوا، تاریخ/ساعت و بخش احراز هویت ادمین */}
        <div className="flex items-center justify-end gap-2.5 shrink-0 flex-wrap">
          
          {/* ویجت زنده آب و هوا */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-xs">
            {renderWeatherIcon()}
            <div className="flex flex-col text-right leading-tight">
              <span className="font-bold text-slate-800 dark:text-slate-200">{weather.temp}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{weather.condition}</span>
            </div>
          </div>

          {/* ویجت تاریخ و ساعت شمسی */}
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-xs">
            <Calendar size={16} className="text-cyan-500" />
            <div className="flex flex-col text-right leading-tight">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{dateStr || '...'}</span>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-1 justify-end">
                <Clock size={10} /> {time || '--:--:--'}
              </span>
            </div>
          </div>

          {/* دکمه تغییر تم روز / شب */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-500 transition-colors"
            title="تغییر تم"
          >
            {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
          </button>

          {/* بخش احراز هویت کاربر و ادمین */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* اگر ادمین یا سوپرادمین باشد: دکمه مدیریت کاربران */}
              {(isSuperAdmin || isAdmin) && (
                <button
                  onClick={onOpenUserModal}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
                  title="مدیریت کاربران پورتال"
                >
                  <UserPlus size={15} />
                  <span className="hidden xl:inline">کاربران</span>
                </button>
              )}

              {/* پروفایل کاربر جاری */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.fullName ? user.fullName.charAt(0) : <User size={14} />}
                </div>
                <div className="flex flex-col text-right leading-tight">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                    {user.fullName || user.username}
                  </span>
                  {getRoleBadge(user.role)}
                </div>
              </div>

              {/* دکمه خروج */}
              <button
                onClick={logout}
                className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                title="خروج از حساب"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            /* دکمه ورود در صورت لاگین نبودن */
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition-all"
            >
              <LogIn size={15} />
              <span>ورود ادمین</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
