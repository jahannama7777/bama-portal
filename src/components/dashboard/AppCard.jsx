'use client';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default function AppCard({ titleFa, titleEn, desc, icon: Icon, iconBg, gradient, href = '#' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-white dark:bg-gradient-to-b ${gradient || 'dark:from-[#111827] dark:to-[#0b1120]'} border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-cyan-500/50 dark:hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between`}
    >
      {/* آیکون و بج وضعیت */}
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} />
        </div>
        <span className="opacity-0 group-hover:opacity-100 text-slate-400 group-hover:text-cyan-500 transition-opacity">
          <ExternalLink size={15} />
        </span>
      </div>

      {/* عناوین و توضیحات */}
      <div className="mt-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
          {titleFa}
        </h3>
        <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
          {titleEn}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
          {desc}
        </p>
      </div>

      {/* دکمه ورود */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        <span className="text-[10px] font-medium text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
          ورود به سامانه
        </span>
        <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-cyan-500 group-hover:text-white transition-all">
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
        </div>
      </div>
    </a>
  );
}
