'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
  Users // آیکون اضافه شد
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';

// مختصات جغرافیایی منطقه معدن باما (ایران‌کوه - جنوب غرب اصفهان)
const LATITUDE = 32.51;
const LONGITUDE = 51.52;

export default function Header({
  searchTerm = '',
  setSearchTerm = () => {},
  onOpenLogin = () => {},
  onOpenUserManagement = () => {}, // پراپ جدید برای باز کردن مودال
}) {
  const authContext = useAuth?.() || {};
  const { user = null, logout = () => {} } = authContext;

  // منطق دسترسی: ادمینِ فناوری اطلاعات یا سوپرادمین
  const canManageUsers = user && (
    user.role === 'SUPERADMIN' || 
    (user.role === 'ADMIN' && user.department === 'فناوری اطلاعات')
  );

  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isDark, setIsDark] = useState(true);

  const [weather, setWeather] = useState({
    temp: '--',
    condition: 'در حال دریافت...',
    icon: 'sun'
  });

  // مدیریت زمان و تاریخ شمسی
  useEffect(() => {
    setMounted(true);
    const checkInitialTheme = () => {
      if (typeof document !== 'undefined') {
        setIsDark(document.documentElement.classList.contains('dark'));
      }
    };
    checkInitialTheme();

    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('fa-IR', { weekday: 'short', day: 'numeric', month: 'short' }));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // دریافت زنده آب و هوای منطقه با تایم‌زون رسمی ایران
  useEffect(() => {
    async function fetchWeather() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current_weather=true&timezone=Asia%2FTehran`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data?.current_weather) {
          const temp = Math.round(data.current_weather.temperature);
          const code = data.current_weather.weathercode;
          
          let condition = 'آفتابی';
          let icon = 'sun';

          // تحلیل دقیق‌تر کدهای استاندارد WMO
          if (code === 0) {
            condition = 'صاف و آفتابی';
            icon = 'sun';
          } else if (code >= 1 && code <= 3) {
            condition = 'نیمه‌ابری';
            icon = 'cloud-sun';
          } else if (code >= 45 && code <= 48) {
            condition = 'مه‌آلود';
            icon = 'cloud';
          } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
            condition = 'بارانی';
            icon = 'rain';
          } else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
            condition = 'برفی';
            icon = 'snow';
          } else if (code >= 95 && code <= 99) {
            condition = 'رعد و برق';
            icon = 'thunder';
          }

          setWeather({ temp: `${temp}°C`, condition, icon });
        }
      } catch {
        // در صورت عدم دسترسی شبکه
        setWeather({ temp: '--', condition: 'عدم ارتباط', icon: 'cloud' });
      }
    }

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000); // به‌روزرسانی هر ۳۰ دقیقه
    return () => clearInterval(interval);
  }, []);

  const renderWeatherIcon = () => {
    switch (weather.icon) {
      case 'rain': return <CloudRain size={16} className="text-cyan-400" />;
      case 'snow': return <CloudSnow size={16} className="text-sky-300" />;
      case 'thunder': return <CloudLightning size={16} className="text-amber-400" />;
      case 'cloud-sun': return <CloudSun size={16} className="text-amber-400" />;
      case 'cloud': return <Cloud size={16} className="text-slate-400" />;
      default: return <Sun size={16} className="text-amber-400" />;
    }
  };

  const toggleTheme = () => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.toggle('dark');
      setIsDark(root.classList.contains('dark'));
    }
  };

  const getRoleConfig = (role) => {
    switch (role) {
      case 'SUPERADMIN': return { title: 'مدیر ارشد', icon: ShieldAlert, badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20', avatarGradient: 'from-rose-500 via-pink-600 to-amber-500' };
      case 'ADMIN': return { title: 'مدیر سیستم', icon: ShieldCheck, badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20', avatarGradient: 'from-amber-500 via-orange-600 to-cyan-500' };
      default: return { title: 'پرسنل', icon: Shield, badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', avatarGradient: 'from-cyan-500 via-blue-600 to-indigo-600' };
    }
  };

  const roleConfig = user ? getRoleConfig(user.role) : null;
  const RoleIcon = roleConfig?.icon || User;

  return (
    <header className="shrink-0 px-4 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300">
      <div className="flex items-center justify-between gap-4">
        
        {/* ۱. لوگو و عنوان */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-200/50 p-1 flex items-center justify-center overflow-hidden">
            <Image src="/logo.png" alt="لوگوی باما" width={32} height={32} className="w-full h-full object-contain" priority />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">پورتال سازمانی باما</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">پیشخوان خدمات درون‌سازمانی</p>
          </div>
        </div>

        {/* ۲. نوار جستجو */}
        <div className="flex-1 max-w-sm mx-2">
          <div className="relative flex items-center group">
            <Search size={15} className="absolute right-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو..."
              className="w-full pr-10 pl-4 py-2 text-xs rounded-xl bg-white/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-white/10 outline-none focus:ring-2 focus:ring-cyan-500/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all"
            />
          </div>
        </div>

        {/* ۳. ویجت‌های زمان و آب و هوا (نمایش در دسکتاپ) */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/10">
            <Clock size={14} className="text-cyan-500" />
            <div className="flex flex-col leading-tight text-right">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{mounted ? time : '--:--'}</span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400">{mounted ? dateStr : ''}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/10">
            {renderWeatherIcon()}
            <div className="flex flex-col leading-tight text-right">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{weather.temp}</span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400">{weather.condition}</span>
            </div>
          </div>
        </div>

        {/* ۴. بخش ابزارها و کاربر */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={toggleTheme} className="p-2 rounded-xl bg-white/50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* دکمه مدیریت کاربران (نمایش شرطی) */}
          {canManageUsers && (
            <button 
              onClick={onOpenUserManagement}
              className="p-2 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 hover:scale-105 transition-transform"
              title="مدیریت کاربران"
            >
              <Users size={16} />
            </button>
          )}

          {user ? (
            <div className="flex items-center p-1 rounded-2xl bg-white/60 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-lg">
              <div className="flex items-center gap-2 px-2 py-0.5">
                <div className={`w-8 h-8 rounded-xl bg-linear-to-tr ${roleConfig?.avatarGradient} flex items-center justify-center text-white text-xs font-black shadow-md`}>
                  {user.fullName?.charAt(0)}
                </div>
                <div className="flex flex-col text-right leading-tight">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user.fullName}</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 rounded-md border ${roleConfig?.badgeColor}`}>
                    <RoleIcon size={10} /> {roleConfig?.title}
                  </span>
                </div>
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1" />
              <button onClick={logout} className="p-2 rounded-xl text-slate-400 hover:text-rose-500 transition-all">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={onOpenLogin} className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-all shadow-md shadow-cyan-600/20">ورود</button>
          )}
        </div>
      </div>
    </header>
  );
}
