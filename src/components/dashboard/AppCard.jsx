"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { Edit2, Trash2 } from "lucide-react";

// تم‌های رنگی مینیمال
const COLOR_THEMES = [
  {
    iconBox: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white group-hover:shadow-cyan-500/30",
    textFa: "text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
  },
  {
    iconBox: "bg-purple-500/15 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white group-hover:shadow-purple-500/30",
    textFa: "text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400",
  },
  {
    iconBox: "bg-blue-500/15 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-blue-500/30",
    textFa: "text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400",
  },
  {
    iconBox: "bg-amber-500/15 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-amber-500/30",
    textFa: "text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400",
  },
  {
    iconBox: "bg-rose-500/15 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white group-hover:shadow-rose-500/30",
    textFa: "text-slate-800 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400",
  },
];

function resolveIcon(iconName) {
  if (!iconName || typeof iconName !== "string" || !iconName.trim()) {
    return LucideIcons.Globe;
  }

  const name = iconName.trim();
  let IconComponent = LucideIcons[name];

  if (!IconComponent) {
    const pascalCaseName = name
      .replace(/[-_\s]+(.)?/g, (_, character) =>
        character ? character.toUpperCase() : ""
      )
      .replace(/^./, (character) => character.toUpperCase());

    IconComponent = LucideIcons[pascalCaseName];
  }

  return IconComponent || LucideIcons.Globe;
}

export default function AppCard({
  id,
  titleFa,
  titleEn,
  title,
  desc,
  url,
  icon,
  canManage = false,
  onUpdate,
  onDelete,
}) {
  const Icon = resolveIcon(icon);

  const themeIndex = typeof id === "number" ? id : (String(id).charCodeAt(0) || 0);
  const currentTheme = COLOR_THEMES[themeIndex % COLOR_THEMES.length];
  const displayTitleFa = titleFa || title || "سامانه سازمانی";

  // ایجاد تاخیر زمانی ملایم برای هر کارت تا هم‌زمان برق نزنند و چشم را اذیت نکنند
  const shimmerDelay = `${(themeIndex % 5) * 0.6}s`;

  const handleDelete = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (window.confirm(`آیا از حذف سامانه «${displayTitleFa}» اطمینان دارید؟`)) {
      onDelete?.(id);
    }
  };

  const handleUpdate = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onUpdate?.(id);
  };

  return (
    <div
      className="group relative flex flex-col justify-between p-3.5 transition-all duration-300 select-none hover:-translate-y-0.5 rounded-xl overflow-hidden hover:bg-white/10 dark:hover:bg-white/4"
      dir="rtl"
    >
      {/* تعریف انیمیشن برق زدن ۳ ثانیه‌ای */}
      <style jsx>{`
        @keyframes sweepGlow {
          0% {
            transform: translateX(-150%) skewX(-20deg);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          40% {
            transform: translateX(200%) skewX(-20deg);
            opacity: 0;
          }
          100% {
            transform: translateX(200%) skewX(-20deg);
            opacity: 0;
          }
        }
        .card-shimmer {
          animation: sweepGlow 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* لایه پرتو نور / برق بک‌گراند */}
      <div
        className="pointer-events-none absolute inset-y-0 w-32 bg-linear-to-r from-transparent via-white/10 dark:via-cyan-400/15 to-transparent card-shimmer"
        style={{ animationDelay: shimmerDelay }}
      />

      {/* خط جداکننده عمودی (سمت چپ) */}
      <div className="pointer-events-none absolute left-0 top-2 bottom-2 w-px bg-linear-to-b from-transparent via-slate-400/60 dark:via-white/30 to-transparent z-10" />

      {/* خط جداکننده افقی (پایین) */}
      <div className="pointer-events-none absolute bottom-0 right-2 left-2 h-px bg-linear-to-r from-transparent via-slate-400/40 dark:via-white/20 to-transparent z-10" />

      {/* دکمه‌های مدیریتی (ویرایش و حذف) */}
      {canManage && (
        <div className="absolute left-3 top-2 z-30 flex items-center gap-1 opacity-0 -translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
          <button
            type="button"
            onClick={handleUpdate}
            className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-white/10 backdrop-blur-md transition-all hover:scale-110 hover:text-cyan-500 hover:border-cyan-500"
            title="ویرایش سامانه"
          >
            <Edit2 size={11} />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-white/10 backdrop-blur-md transition-all hover:scale-110 hover:text-rose-500 hover:border-rose-500"
            title="حذف سامانه"
          >
            <Trash2 size={11} />
          </button>
        </div>
      )}

      {/* محتوای لینک سامانه */}
      <a
        href={url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-full flex-col justify-between z-10"
      >
        <div>
          {/* باکس آیکون */}
          <div className="mb-2 flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-md ${currentTheme.iconBox}`}
            >
              <Icon size={20} strokeWidth={2} />
            </div>
          </div>

          {/* عنوان فارسی سامانه */}
          <h3
            className={`text-right text-[11px] sm:text-xs font-semibold truncate transition-colors duration-200 ${currentTheme.textFa}`}
          >
            {displayTitleFa}
          </h3>
        </div>
      </a>
    </div>
  );
}
