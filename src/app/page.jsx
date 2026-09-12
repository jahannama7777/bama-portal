'use client';

import { useState, useEffect } from 'react';
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/Sidebar';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import AppCard from '../components/dashboard/AppCard';
import SidebarWidgets from '../components/dashboard/SidebarWidgets';

import { 
  Server,
  Pickaxe,
  Wrench,
  Clock,
  Layers,
  FolderKanban,
  ShieldCheck,
  UserCheck,
  Mail,
  BarChart3,
  MessageSquareCode,
  Wifi,
  Contact,
  Building2,
  BookOpenCheck,
  Truck,
  Headphones,
  Search,
  Grid
} from 'lucide-react';

const allApps = [
  {
    id: 1,
    titleFa: 'فایل سرور اداری',
    titleEn: 'Office File Server',
    desc: 'مخزن اسناد و فایل‌های عمومی و اداری شرکت',
    icon: Server,
    gradient: 'dark:from-[#0f172a] dark:to-[#070c18]',
    iconBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/20',
    href: '#'
  },
  {
    id: 2,
    titleFa: 'فایل سرور معدن',
    titleEn: 'Mine File Server',
    desc: 'اسناد فنی، نقشه‌ها و داده‌های اختصاصی استخراج معدن',
    icon: Pickaxe,
    gradient: 'dark:from-[#1c1917] dark:to-[#070c18]',
    iconBg: 'bg-gradient-to-tr from-amber-600 to-orange-600 shadow-orange-500/20',
    href: '#'
  },
  {
    id: 3,
    titleFa: 'فایل سرور مهندسی',
    titleEn: 'Engineering File Server',
    desc: 'آرشیو طرح‌ها، مستندات فنی و مهندسی پروژه',
    icon: Wrench,
    gradient: 'dark:from-[#1e1b4b] dark:to-[#070c18]',
    iconBg: 'bg-gradient-to-tr from-violet-600 to-purple-600 shadow-violet-500/20',
    href: '#'
  },
  {
    id: 4,
    titleFa: 'سامانه کسرا قدیم',
    titleEn: 'Kasra Legacy',
    desc: 'سیستم قدیمی حضور و غیاب و ثبت کارکرد پرسنل',
    icon: Clock,
    gradient: 'dark:from-[#1e293b] dark:to-[#070c18]',
    iconBg: 'bg-gradient-to-tr from-slate-600 to-slate-800 shadow-slate-500/20',
    href: '#'
  },
  {
    id: 5,
    titleFa: 'سامانه کسرا جدید',
    titleEn: 'Kasra ERP (New)',
    desc: 'نسخه مدرن اتوماسیون تردد، شیفت‌ها و منابع انسانی',
    icon: Layers,
    gradient: 'dark:from-[#064e3b] dark:to-[#070c18]',
    iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-600 shadow-emerald-500/20',
    href: '#'
  },
  {
    id: 6,
    titleFa: 'اتوماسیون اداری',
    titleEn: 'Office Automation',
    desc: 'گردش مکاتبات اداری، نامه‌نگاری و پیگیری دستورات',
    icon: FolderKanban,
    gradient: 'dark:from-[#1e1b4b] dark:to-[#070c18]',
    iconBg: 'bg-gradient-to-tr from-indigo-600 to-sky-600 shadow-indigo-500/20',
    href: '#'
  },
  {
    id: 7,
    titleFa: 'سامانه دژبان',
    titleEn: 'Security & Access',
    desc: 'مدیریت تردد خودروها، مهمانان و حراست فیزیکی',
    icon: ShieldCheck,
    gradient: 'dark:from-[#312e81] dark:to-[#070c18]',
    iconBg: 'bg-gradient-to-tr from-blue-700 to-slate-900 shadow-blue-700/20',
    href: '#'
  },
  {
    id: 8,
    titleFa: 'سامانه کارمند',
    titleEn: 'Employee Portal',
    desc: 'پورتال امور رفاهی، فیش حقوقی و خدمات پرسنلی',
    icon: UserCheck,
    gradient: 'dark:from-[#4c0519] dark:to-[#070c18]',
    iconBg: 'bg-gradient-to-tr from-rose-600 to-pink-600 shadow-rose-500/20',
    href: '#'
  },
  {
    id: 9,
    titleFa: 'ایمیل سازمانی',
    titleEn: 'Webmail Service',
    desc: 'سامانه ارسال و دریافت نامه‌های الکترونیکی باما',
    icon: Mail,
    gradient: 'dark:from-[#082f49] dark:to-[#070c18]',
    iconBg: 'bg-gradient-to-tr from-sky-500 to-blue-600 shadow-sky-500/20',
    href: '#'
  },
  {
    id: 10,
    titleFa: 'سرور PowerBI',
    titleEn: 'PowerBI Server',
    desc: 'داشبوردهای هوش تجاری و گزارش‌های تحلیلی مدیریتی',
    icon: BarChart3,
    gradient: 'dark:from-[#451a03] dark:to-[#070c18]',
    iconBg: 'bg-gradient-to-tr from-amber-500 to-yellow-600 shadow-yellow-500/20',
    href: '#'
  },
  {
    id: 11,
    titleFa: 'سامانه چت آنلاین',
    titleEn: 'Internal Chat',
    desc: 'پیام‌رسان امن و گفت‌وگوی آنی همکاران سازمان',
    icon: MessageSquareCode,
    gradient: 'dark:from-[#042f2e] dark:to-[#070c18]',
    iconBg: 'bg-gradient-to-tr from-teal-500 to-emerald-600 shadow-teal-500/20',
    href: '#'
  },
  {
    id: 12,
    titleFa: 'پنل اینترنت کاربران',
    titleEn: 'User Internet Panel',
    desc: 'مدیریت پهنای باند، حجم و احراز هویت شبکه',
    icon: Wifi,
    gradient: 'dark:from-[#172554] dark:to-[#070c18]',
    iconBg: 'bg-gradient-to-tr from-cyan-600 to-blue-700 shadow-cyan-600/20',
    href: '#'
  },
  {
    id: 13,
    titleFa: 'لیست ایمیل سازمانی',
    titleEn: 'Company Directory',
    desc: 'فهرست آدرس‌ها، مخاطبین و پست‌های الکترونیک داخلی',
    icon: Contact,
    gradient: 'dark:from-[#3b0764] dark:to-[#070c18]',
    iconBg: 'bg-gradient-to-tr from-fuchsia-600 to-purple-700 shadow-fuchsia-600/20',
    href: '#'
  },
  {
    id: 14,
    titleFa: 'راهکاران سیستم',
    titleEn: 'Rahkaran System (ERP)',
    desc: 'سیستم جامع مالی، انبار، تدارکات و لجستیک',
    icon: Building2,
    gradient: 'dark:from-[#022c22] dark:to-[#070c18]',
    iconBg: 'bg-gradient-to-tr from-emerald-500 to-green-700 shadow-green-600/20',
    href: '#'
  },
  {
    id: 15,
    titleFa: 'کتابخانه و مرکز دانش',
    titleEn: 'Knowledge Base',
    desc: 'بانک استانداردها، مقالات و آیین‌نامه‌های سازمانی',
    icon: BookOpenCheck,
    gradient: 'dark:from-[#36162e] dark:to-[#070c18]',
    iconBg: 'bg-gradient-to-tr from-pink-600 to-rose-700 shadow-pink-600/20',
    href: '#'
  },
  {
    id: 16,
    titleFa: 'همیار معدن',
    titleEn: 'Mine Assistant',
    desc: 'سامانه یکپارچه مانیتورینگ و توزین ماشین‌آلات معدنی',
    icon: Truck,
    gradient: 'dark:from-[#291307] dark:to-[#070c18]',
    iconBg: 'bg-gradient-to-tr from-orange-600 to-amber-700 shadow-orange-600/20',
    href: '#'
  },
  {
    id: 17,
    titleFa: 'سامانه پشتیبانی',
    titleEn: 'IT Helpdesk Ticketing',
    desc: 'ثبت تیکت‌های پشتیبانی IT و درخواست‌های فنی',
    icon: Headphones,
    gradient: 'dark:from-[#132a40] dark:to-[#070c18]',
    iconBg: 'bg-gradient-to-tr from-blue-500 to-teal-500 shadow-teal-500/20',
    href: '#'
  }
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log(
      `%c BAMA PORTAL SYSTEM %c Designed & Developed by Jaber Bakrani %c`,
      'background: #0284c7; color: #fff; border-radius: 3px 0 0 3px; padding: 4px 8px; font-weight: bold;',
      'background: #0f172a; color: #38bdf8; border-radius: 0 3px 3px 0; padding: 4px 8px; font-weight: 600;',
      'background: transparent'
    );
    
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, '__AUTHOR__', {
        value: 'Jaber Bakrani (جابر بکرانی)',
        writable: false,
        configurable: false
      });
    }
  }, []);

  // فیلتر بلادرنگ ۱۷ سامانه بر اساس متن سرچ هدر یا بدنه
  const filteredApps = allApps.filter((app) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      app.titleFa.toLowerCase().includes(term) ||
      app.titleEn.toLowerCase().includes(term) ||
      app.desc.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070c18] text-slate-800 dark:text-slate-100 flex font-sans transition-colors duration-300" dir="rtl">
      
      {/* سایدبار ناوبری */}
      <Sidebar />

      {/* ستون اصلی پورتال */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* هدر یکپارچه */}
        <Header 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          isAdmin={isAdmin} 
          setIsAdmin={setIsAdmin} 
        />

        {/* محتوای اصلی داشبورد */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            
            {/* بخش اصلی کارت‌ها و بنر */}
            <div className="xl:col-span-3 space-y-8">
              
              <WelcomeBanner />

              {/* نوار وضعیت و شمارنده سامانه‌ها */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <Grid size={20} className="text-cyan-500" />
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        سامانه‌های یکپارچه شرکت باما
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      دسترسی سریع به سامانه‌ها ({filteredApps.length} از ۱۷ سامانه نمایش داده شده)
                    </p>
                  </div>

                  {/* نوار جستجوی درون صفحه (همگام با هدر) */}
                  <div className="relative w-full sm:w-72">
                    <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="فیلتر سریع سامانه‌ها..."
                      className="w-full pl-4 pr-10 py-2 text-xs rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 focus:border-cyan-500 outline-none text-slate-800 dark:text-slate-200 shadow-sm transition-colors"
                    />
                  </div>
                </div>

                {/* ماتریس شبکه‌ای کارت‌ها */}
                {filteredApps.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredApps.map((app) => (
                      <AppCard key={app.id} {...app} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-[#0f172a]/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                    <p className="text-sm text-slate-500">
                      سامانه‌ای با عبارت «{searchTerm}» یافت نشد.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* ویجت‌های اعلان و سایدبار چپ */}
            <div className="xl:col-span-1">
              <SidebarWidgets />
            </div>

          </div>
        </main>

        {/* فوتر رسمی سامانه */}
        <footer className="px-8 py-4 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 bg-white/40 dark:bg-[#0b1120]/40 transition-colors">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-600 dark:text-slate-400">تمام ۱۷ سامانه باما در وضعیت آنلاین و پایدار هستند</span>
          </div>

          <div className="flex items-center gap-3">
            <span>پیشخوان کاربری شرکت باما © ۱۴۰۳</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="group relative cursor-default text-[10px] text-slate-400 dark:text-slate-500 hover:text-cyan-500 transition-colors">
              طراحی و پیاده‌سازی: <strong className="font-semibold text-slate-600 dark:text-slate-400">J.Bakrani</strong>
            </span>
          </div>
        </footer>

      </div>

    </div>
  );
}
