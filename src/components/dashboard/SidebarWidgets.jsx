import { Megaphone, GraduationCap, RefreshCw, Calendar, Activity, FileText, Headphones, BarChart3, UserPlus } from 'lucide-react';

const notices = [
  {
    icon: GraduationCap,
    iconColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
    title: 'برگزاری دوره آموزشی امنیت اطلاعات',
    desc: 'دوره آموزشی آشنایی با اصول امنیت اطلاعات در تاریخ ۲۵ اردیبهشت برگزار می‌شود.',
    time: '۲ ساعت پیش'
  },
  {
    icon: RefreshCw,
    iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
    title: 'بروزرسانی سامانه کسرا',
    desc: 'نسخه جدید سامانه کسرا با بهبودهای عملکردی در دسترس قرار گرفت.',
    time: '۵ ساعت پیش'
  },
  {
    icon: Calendar,
    iconColor: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20',
    title: 'اطلاعیه تعطیلات رسمی',
    desc: 'به مناسبت روز معلم، روز چهارشنبه ۲۴ اردیبهشت تعطیل خواهد بود.',
    time: '۱۱ ساعت پیش'
  }
];

const activities = [
  { icon: FileText, iconColor: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10', title: 'فایل جدید در سرور فایل‌ها بارگذاری شد', user: 'توسط جابر بکرانی', time: '۱۴:۲۱' },
  { icon: Headphones, iconColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10', title: 'درخواست پشتیبانی جدید ثبت شد', user: 'توسط جابر بکرانی', time: '۱۳:۵۲' },
  { icon: BarChart3, iconColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10', title: 'گزارش فروش در PowerBI بروزرسانی شد', user: 'توسط تیم تحلیل داده', time: '۱۲:۴۳' },
  { icon: Calendar, iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10', title: 'مرخصی جدید ثبت شد', user: 'توسط جابر بکرانی', time: '۱۱:۳۵' },
  { icon: UserPlus, iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10', title: 'کاربر جدید به سیستم اضافه شد', user: 'توسط مدیر سیستم', time: '۱۰:۰۳' }
];

export default function SidebarWidgets() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white dark:bg-[#0f172a]/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 p-6 shadow-sm dark:shadow-none transition-colors duration-300">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm">
            <Megaphone size={18} className="text-cyan-500" />
            <span>اطلاعیه‌ها</span>
          </div>
          <button className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline">
            مشاهده همه
          </button>
        </div>

        <div className="space-y-4">
          {notices.map((n, i) => {
            const Icon = n.icon;
            return (
              <div key={i} className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/60 last:border-0 last:pb-0">
                <div className={`p-2.5 rounded-xl border shrink-0 ${n.iconColor}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{n.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{n.desc}</p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 block">{n.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#0f172a]/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 p-6 shadow-sm dark:shadow-none transition-colors duration-300">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm">
            <Activity size={18} className="text-cyan-500" />
            <span>فعالیت‌های اخیر</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">زنده</span>
        </div>

        <div className="space-y-4">
          {activities.map((a, i) => {
            const Icon = a.icon;
            return (
              <div key={i} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${a.iconColor}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-700 dark:text-slate-200 text-[11px] font-medium truncate">{a.title}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{a.user}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{a.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
