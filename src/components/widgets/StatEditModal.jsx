'use client';

import { useState, useEffect } from 'react';
import { X, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

export default function StatEditModal({ isOpen, onClose, onSave, editData }) {
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    change: '',
    isIncrease: true,
  });

  // پر کردن فرم به هنگام باز شدن مدال یا تغییر editData
  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title || editData.titleFa || editData.label || '',
        value: editData.value !== undefined && editData.value !== null ? String(editData.value) : '',
        change: editData.change || editData.desc || '',
        isIncrease: editData.isIncrease ?? true,
      });
    } else {
      setFormData({
        title: '',
        value: '',
        change: '',
        isIncrease: true,
      });
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSave({
      ...editData, // حفظ ID و ساختار قبلی آیتم
      title: formData.title.trim(),
      titleFa: formData.title.trim(),
      label: formData.title.trim(),
      value: formData.value.trim(),
      change: formData.change.trim(),
      isIncrease: formData.isIncrease,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div
        className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl text-slate-800 dark:text-white overflow-hidden"
        dir="rtl"
      >
        {/* هدر مدال */}
        <div className="p-5 pb-3 border-b border-slate-200/60 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {editData ? 'ویرایش آمار' : 'افزودن کارت آمار جدید'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تغییر عنوان، مقدار و میزان تغییرات آمار
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* فرم مدال */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* عنوان آمار */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              عنوان آمار <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: سامانه‌های فعال، کاربران آنلاین"
              required
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* مقدار و میزان تغییرات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                مقدار (عددی / متنی) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="مثال: ۱۷ یا ۱,۲۵۰"
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                میزان تغییرات (اختیاری)
              </label>
              <input
                type="text"
                value={formData.change}
                onChange={(e) => setFormData({ ...formData, change: e.target.value })}
                placeholder="مثال: ۱۲%+ یا رشد ماهانه"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* روند تغییرات (افزایشی / کاهش) */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">
              روند تغییرات
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isIncrease: true })}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  formData.isIncrease
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <TrendingUp size={16} />
                <span>مثبت / افزایشی</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isIncrease: false })}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  !formData.isIncrease
                    ? 'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <TrendingDown size={16} />
                <span>منفی / کاهشی</span>
              </button>
            </div>
          </div>

          {/* دکمه‌های عملیاتی */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-200/60 dark:border-white/10">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/20 active:scale-[0.98]"
            >
              {editData ? 'ذخیره تغییرات' : 'افزودن آمار'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
