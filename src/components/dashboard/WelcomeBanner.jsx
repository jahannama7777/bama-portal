"use client";

import { useState } from "react";
import { Sparkles, Edit2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useStats } from "../../context/StatsContext";
import { useApps } from "../../context/AppsContext"; // ← دریافت سامانه‌ها به صورت زنده
import { useAuth } from "../../context/AuthContext";
import StatEditModal from "../widgets/StatEditModal";

// تابع تبدیل ارقام انگلیسی به فارسی
function toPersianDigits(num) {
  if (num === null || num === undefined) return "";
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (x) => farsiDigits[parseInt(x, 10)]);
}

function resolveStatIcon(iconName) {
  if (!iconName || typeof iconName !== "string") return LucideIcons.Activity;
  const name = iconName.trim();
  const pascalName = name
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^./, (c) => c.toUpperCase());
  return LucideIcons[name] || LucideIcons[pascalName] || LucideIcons.Activity;
}

export default function WelcomeBanner() {
  const { stats = [], updateStat } = useStats();
  const { apps = [] } = useApps(); // ← لیست زنده تمام سامانه‌ها
  const auth = useAuth?.() || {};

  const canManage = auth?.can?.manageApps?.(auth.user) ?? false;

  const [selectedStat, setSelectedStat] = useState(null);

  const handleOpenEdit = (e, st, index) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedStat({
      ...st,
      id: st.id !== undefined && st.id !== null ? String(st.id) : String(index),
    });
  };

  const handleSaveStat = (newData) => {
    if (selectedStat && updateStat) {
      updateStat(selectedStat.id, newData);
    }
    setSelectedStat(null);
  };

  return (
    <>
      <div className="relative w-full overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-cyan-950/40 p-3.5 md:p-4 shadow-xl backdrop-blur-xl dark:border-white/10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* بخش راست: معرفی پورتال */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-md shadow-cyan-500/25">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white md:text-base leading-tight">
                پورتال جامع سامانه‌های داخلی شرکت باما
              </h2>
              <p className="mt-0.5 text-xs text-slate-300">
                دسترسی سریع و یکپارچه به تمامی ابزارها و اتوماسیون‌های سازمانی
              </p>
            </div>
          </div>

          {/* بخش چپ: کپسول‌های آمار داینامیک */}
          <div className="flex flex-wrap items-center gap-2">
            {stats.map((st, idx) => {
              const IconComp = resolveStatIcon(st.icon);
              const titleText = st.titleFa || st.title || st.label || "آمار";

              // تشخیص آیتم «سامانه فعال» جهت محاسبه کاملاً زنده از روی apps.length
              const isAppCountStat =
                st.id === "stat-1" ||
                titleText.includes("سامانه") ||
                idx === 0;

              // مقدار نهایی نمایشی: زنده برای سامانه‌ها، مقدار ذخیره شده برای بقیه
              const displayValue = isAppCountStat
                ? toPersianDigits(apps.length)
                : st.value;

              return (
                <div
                  key={st.id || idx}
                  onClick={(e) => canManage && handleOpenEdit(e, st, idx)}
                  className="group relative flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-md transition-all hover:border-cyan-400/50 hover:bg-white/15 cursor-pointer"
                >
                  <div className="text-cyan-400">
                    <IconComp size={15} />
                  </div>
                  <div className="flex items-baseline gap-1 text-xs">
                    <span className="font-bold text-white tracking-wide">
                      {displayValue}
                    </span>
                    <span className="text-[11px] text-slate-300">
                      {titleText}
                    </span>
                  </div>

                  {/* آیکون مداد برای دسترسی راحت‌تر */}
                  {canManage && (
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(e, st, idx)}
                      className="mr-1 p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-white/15 transition-all"
                      title="ویرایش این آمار"
                    >
                      <Edit2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* مدال ویرایش */}
      {selectedStat && (
        <StatEditModal
          isOpen={Boolean(selectedStat)}
          stat={selectedStat}
          onClose={() => setSelectedStat(null)}
          onSave={handleSaveStat}
          onSubmit={handleSaveStat}
        />
      )}
    </>
  );
}
