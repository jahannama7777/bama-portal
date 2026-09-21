'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Globe, AppWindow, Link2, FileText, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useToast } from '@/src/context/ToastContext';

// آیکون‌های پرکاربرد برای انتخاب سریع در پورتال سازمانی
const POPULAR_ICONS = [
  'Server', 'Pickaxe', 'Wrench', 'Clock', 'UserCheck', 
  'Layers', 'ShieldCheck', 'Mail', 'BarChart3', 'Wifi', 
  'Contact', 'Building2', 'BookOpenCheck', 'Truck', 'Headphones',
  'Database', 'Settings', 'FolderGit2', 'Monitor', 'HardDrive'
];

export default function AppEditModal({ isOpen, onClose, onSave, appData }) {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    titleFa: '',
    titleEn: '',
    url: '',
    desc: '',
    icon: 'Globe',
  });

  // اطمینان از آماده بودن DOM برای Portal در سمت کلاینت
  useEffect(() => {
    setMounted(true);
  }, []);

  // همگام‌سازی داده‌های ورودی با فرم
  useEffect(() => {
    if (appData) {
      setFormData({
        titleFa: appData.titleFa || '',
        titleEn: appData.titleEn || '',
        url: appData.url || appData.href || '',
        desc: appData.desc || '',
        icon: appData.icon || 'Globe',
      });
    }
  }, [appData, isOpen]);

  // بستن مودال با کلید Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.titleFa.trim()) {
      showToast('لطفاً عنوان فارسی سامانه را وارد کنید.', 'error');
      return;
    }

    onSave({
      ...appData,
      titleFa: formData.titleFa.trim(),
      titleEn: formData.titleEn.trim(),
      url: formData.url.trim(),
      href: formData.url.trim(),
      desc: formData.desc.trim(),
      icon: formData.icon,
    });

    showToast(`تغییرات سامانه «${formData.titleFa.trim()}» با موفقیت ثبت شد.`, 'success');
    onClose();
  };

  const SelectedIcon = LucideIcons[formData.icon] || LucideIcons.Globe;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div 
        className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl text-slate-800 dark:text-white overflow-hidden"
        dir="rtl"
      >
        {/* هدر */}
        <div className="p-5 pb-3 border-b border-slate-200/60 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <SelectedIcon size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold">ویرایش سامانه</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">تغییر اطلاعات، آدرس و آیکون سامانه</p>
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

        {/* بدنه فرم */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* عنوان فارسی */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              عنوان فارسی <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <AppWindow className="absolute right-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                value={formData.titleFa}
                onChange={(e) => setFormData({ ...formData, titleFa: e.target.value })}
                placeholder="مثال: اتوماسیون اداری"
                required
                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* عنوان انگلیسی */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              عنوان انگلیسی / شناسه لاتین
            </label>
            <input
              type="text"
              dir="ltr"
              value={formData.titleEn}
              onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
              placeholder="e.g. Office Automation"
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* آدرس سامانه (URL) */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              آدرس سامانه (URL / IP) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Link2 className="absolute right-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                dir="ltr"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="http://192.168.1.10:8080"
                required
                className="w-full pr-9 pl-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* توضیحات */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              توضیحات کوتاه
            </label>
            <div className="relative">
              <FileText className="absolute right-3 top-2.5 text-slate-400" size={16} />
              <textarea
                rows={2}
                value={formData.desc}
                onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                placeholder="توضیح مختصر در مورد کارکرد سامانه..."
                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 transition-colors resize-none"
              />
            </div>
          </div>

          {/* انتخاب آیکون */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              انتخاب آیکون سامانه
            </label>
            <div className="grid grid-cols-5 gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 max-h-36 overflow-y-auto">
              {POPULAR_ICONS.map((iconName) => {
                const ItemIcon = LucideIcons[iconName] || LucideIcons.Globe;
                const isSelected = formData.icon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: iconName })}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-500 ring-1 ring-cyan-500'
                        : 'border-transparent hover:bg-slate-200/60 dark:hover:bg-white/5 text-slate-400'
                    }`}
                    title={iconName}
                  >
                    <ItemIcon size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* دکمه‌ها */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-200/60 dark:border-white/10">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/20 active:scale-[0.98]"
            >
              ذخیره تغییرات سامانه
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

  return createPortal(modalContent, document.body);
}
