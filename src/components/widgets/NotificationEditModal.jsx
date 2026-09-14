'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Search,
  Check,
  UtensilsCrossed,
  Coffee,
  Home,
  Palmtree,
  CalendarDays,
  Clock,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Info,
  Bus,
  Car,
  CreditCard,
  Banknote,
  Stethoscope,
  HeartPulse,
  Dumbbell,
  HardHat,
  Pickaxe,
  Wrench,
  Wifi,
  Laptop,
  PartyPopper,
  Gift,
  FileText,
} from 'lucide-react';

const NOTIFICATION_TYPES = [
  { id: 'food', label: 'رزرو غذا / سلف', icon: UtensilsCrossed },
  { id: 'coffee', label: 'پذیرایی / کافه', icon: Coffee },
  { id: 'villa', label: 'رزرو ویلا / اقامتگاه', icon: Home },
  { id: 'trip', label: 'گردشگری / تور', icon: Palmtree },
  { id: 'bus', label: 'سرویس ایاب و ذهاب', icon: Bus },
  { id: 'car', label: 'تردد خودرو / پارکینگ', icon: Car },
  { id: 'salary', label: 'حقوق و دستمزد', icon: Banknote },
  { id: 'payment', label: 'فیش / پاداش و وام', icon: CreditCard },
  { id: 'contract', label: 'بخشنامه و قرارداد', icon: FileText },
  { id: 'health', label: 'پزشکی و بهداری', icon: Stethoscope },
  { id: 'insurance', label: 'بیمه تکمیلی', icon: HeartPulse },
  { id: 'sport', label: 'ورزش و استخر', icon: Dumbbell },
  { id: 'mine', label: 'معدن و عملیات', icon: Pickaxe },
  { id: 'hse', label: 'HSE و ایمنی', icon: HardHat },
  { id: 'maintenance', label: 'تعمیرات و تاسیسات', icon: Wrench },
  { id: 'it_system', label: 'سیستم‌ها و IT', icon: Laptop },
  { id: 'network', label: 'شبکه و زیرساخت', icon: Wifi },
  { id: 'update', label: 'بروزرسانی سامانه', icon: Sparkles },
  { id: 'shift', label: 'شیفت و نوبت‌کاری', icon: Clock },
  { id: 'calendar', label: 'تقویم و رویداد', icon: CalendarDays },
  { id: 'security_alert', label: 'هشدار امنیتی', icon: ShieldAlert },
  { id: 'security_check', label: 'تاییدیه حراست', icon: ShieldCheck },
  { id: 'celebration', label: 'جشن و مراسم', icon: PartyPopper },
  { id: 'gift', label: 'هدایا و بن کارت', icon: Gift },
  { id: 'info', label: 'اطلاعیه عمومی', icon: Info },
];

const COLOR_OPTIONS = [
  { id: 'cyan', name: 'فیروزه‌ای', class: 'bg-cyan-500' },
  { id: 'emerald', name: 'سبز', class: 'bg-emerald-500' },
  { id: 'amber', name: 'نارنجی / کهربایی', class: 'bg-amber-500' },
  { id: 'rose', name: 'قرمز / رز', class: 'bg-rose-500' },
  { id: 'purple', name: 'بنفش', class: 'bg-purple-500' },
  { id: 'indigo', name: 'نیلی', class: 'bg-indigo-500' },
  { id: 'blue', name: 'آبی', class: 'bg-blue-500' },
];

export default function NotificationEditModal({ isOpen, onClose, onSave, editData }) {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    badge: '',
    type: 'food',
    badgeColor: 'amber',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title || '',
        desc: editData.desc || '',
        badge: editData.badge || '',
        type: editData.type || 'food',
        badgeColor: editData.badgeColor || 'amber',
      });
    } else {
      setFormData({
        title: '',
        desc: '',
        badge: '',
        type: 'food',
        badgeColor: 'amber',
      });
    }
    setSearchTerm('');
  }, [editData, isOpen]);

  const filteredTypes = useMemo(() => {
    if (!searchTerm.trim()) return NOTIFICATION_TYPES;
    return NOTIFICATION_TYPES.filter((item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSave({
      ...formData,
      date: editData?.date || 'هم‌اکنون',
    });
    onClose();
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4" dir="rtl">
      {/* بک‌دراپ تیره تمام‌صفحه */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* پنجره مودال در مرکز صفحه */}
      <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* هدر بالایی مودال */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/50">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">
              {editData ? 'ویرایش اطلاعیه' : 'ثبت اعلان و اطلاعیه جدید'}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              تنظیم محتوا، دسته‌بندی و آیکون اختصاصی جهت نمایش در داشبورد
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* بخش محتوا با اسکرول داخلی استاندارد */}
        <form
          onSubmit={handleSubmit}
          id="notification-form"
          className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5"
        >
          {/* لیست آیکون‌ها و دسته‌بندی */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                انتخاب آیکون و زمینه ({filteredTypes.length} مورد موجود):
              </label>

              <div className="relative w-48 sm:w-56">
                <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="جستجوی آیکون..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-8 pl-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1.5 border border-slate-200/80 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40">
              {filteredTypes.map((item) => {
                const IconComponent = item.icon;
                const isSelected = formData.type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        type: item.id,
                        badge: prev.badge ? prev.badge : item.label.split('/')[0].trim(),
                      }));
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs text-right border transition-all ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-bold shadow-sm ring-1 ring-cyan-500/50'
                        : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected
                          ? 'bg-cyan-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-300'
                      }`}
                    >
                      <IconComponent size={14} />
                    </div>
                    <span className="truncate flex-1">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* فیلد عنوان */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              عنوان اعلان <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: رزرو وعده ناهار کارخانه..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          {/* فیلد برچسب و انتخاب رنگ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                برچسب بالای اعلان (Badge)
              </label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="مثال: رزرو غذا، فوری، اطلاعیه"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                رنگ برچسب
              </label>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    title={c.name}
                    onClick={() => setFormData({ ...formData, badgeColor: c.id })}
                    className={`w-7 h-7 rounded-full ${c.class} flex items-center justify-center transition-transform ${
                      formData.badgeColor === c.id
                        ? 'scale-110 ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {formData.badgeColor === c.id && <Check size={13} className="text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* فیلد متن کامل */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              متن کامل اعلان <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              placeholder="توضیحات کامل اطلاعیه جهت نمایش به پرسنل..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
            />
          </div>
        </form>

        {/* فوتر چسبان با دکمه‌های تایید و انصراف */}
        <div className="shrink-0 flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
          >
            انصراف
          </button>
          <button
            type="submit"
            form="notification-form"
            className="px-5 py-2 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-white shadow-lg shadow-cyan-500/25 transition-all"
          >
            {editData ? 'ذخیره تغییرات' : 'افزودن اعلان'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
