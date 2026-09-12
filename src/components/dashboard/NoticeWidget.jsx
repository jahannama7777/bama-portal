import { Megaphone, ArrowLeft } from 'lucide-react';

export default function NoticeWidget() {
  return (
    <div className="p-5 rounded-2xl bg-linear-to-br from-cyan-500/10 via-white/70 to-indigo-500/10 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-cyan-950/20 backdrop-blur-xl border border-cyan-500/20 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-cyan-600 dark:text-cyan-400 font-bold text-xs">
        <Megaphone size={16} />
        <span>اطلاعیه مهم سازمانی</span>
      </div>
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
        پرتال جدید سازمانی راه‌اندازی شد!
      </h4>
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        به اطلاع پرسنل محترم می‌رساند پیشخوان کاربری جدید با سرعت بالا و دسترسی یکپارچه به تمامی سرورها و سامانه‌ها آماده بهره‌برداری است.
      </p>
      <button className="mt-3 flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:gap-2 transition-all">
        <span>مشاهده جزئیات اطلاعیه‌ها</span>
        <ArrowLeft size={14} />
      </button>
    </div>
  );
}
