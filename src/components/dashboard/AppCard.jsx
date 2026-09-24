"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import * as LucideIcons from "lucide-react";
import { Edit2, Trash2, GripHorizontal, AlertTriangle } from "lucide-react";

// تم‌های رنگی مینیمال
const COLOR_THEMES = [
  {
    iconBox:
      "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white group-hover:shadow-cyan-500/30",
    textFa:
      "text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
  },
  {
    iconBox:
      "bg-purple-500/15 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white group-hover:shadow-purple-500/30",
    textFa:
      "text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400",
  },
  {
    iconBox:
      "bg-blue-500/15 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-blue-500/30",
    textFa:
      "text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400",
  },
  {
    iconBox:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-amber-500/30",
    textFa:
      "text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400",
  },
  {
    iconBox:
      "bg-rose-500/15 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white group-hover:shadow-rose-500/30",
    textFa:
      "text-slate-800 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400",
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
  index = 0,
  titleFa,
  titleEn,
  title,
  desc,
  url,
  icon,
  canManage = false,
  onUpdate,
  onDelete,
  onDragStartItem,
  onDragEnterItem,
  onDragEndItem,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const Icon = resolveIcon(icon);

  const themeIndex =
    typeof id === "number" ? id : String(id).charCodeAt(0) || index || 0;
  const currentTheme = COLOR_THEMES[Math.abs(themeIndex) % COLOR_THEMES.length];
  const displayTitleFa = titleFa || title || titleEn || "سامانه سازمانی";
  const shimmerDelay = `${(Math.abs(themeIndex) % 5) * 0.6}s`;

  // باز کردن مودال حذف
  const askDelete = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setConfirmDelete(true);
  };

  // تایید قطعی حذف
  const handleFinalDelete = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setConfirmDelete(false);
    onDelete?.(id);
  };

  const handleUpdate = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onUpdate?.(id);
  };

  return (
    <>
      {/* مودال تأیید حذف (دقیقاً مشابه الگوی NotificationWidget با ساختار پورتال) */}
      {mounted &&
        confirmDelete &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(false);
            }}
          >
            <div
              dir="rtl"
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200"
            >
              <div className="flex items-center gap-3 text-rose-500 mb-4">
                <div className="p-2 rounded-xl bg-rose-500/10">
                  <AlertTriangle size={24} />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">
                  حذف سامانه
                </h4>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                آیا از حذف سامانه{" "}
                <span className="font-bold text-rose-500">
                  «{displayTitleFa}»
                </span>{" "}
                اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleFinalDelete}
                  className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  بله، حذف شود
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* کامپوننت کارت سامانه */}
      <div
        draggable
        onDragStart={(e) => {
          setIsDragging(true);
          e.dataTransfer.setData("text/plain", String(index));
          e.dataTransfer.effectAllowed = "move";
          onDragStartItem?.(index);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setIsDragOver(true);
          onDragEnterItem?.(index);
        }}
        onDragLeave={() => {
          setIsDragOver(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        onDragEnd={() => {
          setIsDragging(false);
          setIsDragOver(false);
          onDragEndItem?.();
        }}
        className={`group relative flex flex-col justify-between p-3.5 transition-all duration-300 select-none rounded-xl overflow-hidden cursor-grab active:cursor-grabbing hover:bg-white/10 dark:hover:bg-white/5 ${
          isDragging
            ? "opacity-30 scale-95 border-2 border-dashed border-cyan-500"
            : ""
        } ${isDragOver ? "ring-2 ring-cyan-400 bg-cyan-500/10" : ""}`}
        dir="rtl"
      >
        {/* انیمیشن شیمر */}
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

        {/* لایه برق پس‌زمینه */}
        <div
          className="pointer-events-none absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/10 dark:via-cyan-400/15 to-transparent card-shimmer"
          style={{ animationDelay: shimmerDelay }}
        />

        {/* خط جداکننده عمودی (سمت چپ) */}
        <div className="pointer-events-none absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-slate-400/60 dark:via-white/30 to-transparent z-10" />

        {/* خط جداکننده افقی (پایین) */}
        <div className="pointer-events-none absolute bottom-0 right-2 left-2 h-px bg-gradient-to-r from-transparent via-slate-400/40 dark:via-white/20 to-transparent z-10" />

        {/* نشان دستگیره جابه‌جایی در هاور */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none text-slate-500 dark:text-slate-400">
          <GripHorizontal size={14} />
        </div>

        {/* دکمه‌های مدیریتی (ویرایش و حذف) */}
        {canManage && (
          <div className="absolute left-3 top-2 z-30 flex items-center gap-1 opacity-0 -translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
            <button
              type="button"
              onClick={handleUpdate}
              className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-white/10 backdrop-blur-md transition-all hover:scale-110 hover:text-cyan-500 hover:border-cyan-500 cursor-pointer"
              title="ویرایش سامانه"
            >
              <Edit2 size={11} />
            </button>

            <button
              type="button"
              onClick={askDelete}
              className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-white/10 backdrop-blur-md transition-all hover:scale-110 hover:text-rose-500 hover:border-rose-500 cursor-pointer"
              title="حذف سامانه"
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}

        {/* لینک باز کردن سامانه */}
        <a
          href={url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (isDragging) e.preventDefault();
          }}
          className="flex h-full flex-col justify-between z-10 select-none"
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

            {/* عنوان سامانه */}
            <h3
              className={`text-right text-[11px] sm:text-xs font-semibold truncate transition-colors duration-200 ${currentTheme.textFa}`}
            >
              {displayTitleFa}
            </h3>
          </div>
        </a>
      </div>
    </>
  );
}
