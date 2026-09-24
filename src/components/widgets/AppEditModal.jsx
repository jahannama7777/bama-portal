'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Globe, 
  AppWindow, 
  Link2, 
  FileText, 
  Search,
  HelpCircle
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useToast } from '@/src/context/ToastContext';

// توابعی که در پکیج lucide هستند ولی کامپوننت آیکون نیستند
const EXCLUDED_KEYS = new Set([
  'default',
  'createLucideIcon',
  'LucideIcon',
  'icons'
]);

// استخراج خودکار کل آیکون‌های کتابخانه
const ALL_PORTAL_ICONS = Object.keys(LucideIcons)
  .filter((key) => {
    return (
      !EXCLUDED_KEYS.has(key) &&
      /^[A-Z]/.test(key) &&
      (typeof LucideIcons[key] === 'function' || typeof LucideIcons[key] === 'object')
    );
  })
  .sort();

// دیکشنری جامع تگ‌ها و کلمات کلیدی فارسی برای سرچ سریع
const FA_TAGS = {
  // شبکه، سرور و زیرساخت
  Server: ['سرور', 'رک', 'میزبان', 'کامپیوتر', 'دیتاسنتر', 'هاست'],
  Database: ['دیتابیس', 'پایگاه داده', 'بانک اطلاعاتی', 'مخزن داده', 'sql'],
  HardDrive: ['هارد', 'دیسک', 'حافظه', 'ذخیره سازی', 'storage'],
  Cpu: ['پردازنده', 'سخت افزار', 'سی پی یو', 'چیپست'],
  Network: ['شبکه', 'ارتباطات', 'گره', 'اتصال'],
  Wifi: ['وای فای', 'بیسیم', 'اینترنت', 'وایرلس'],
  Router: ['روتر', 'مسیر یاب', 'مودم', 'سوییچ'],
  RadioTower: ['دکل', 'انتن', 'فرستنده', 'مخابرات', 'سایت'],
  Radio: ['رادیو', 'بیسیم', 'ارتباطی'],
  Cable: ['کابل', 'شبکه', 'سیم', 'لن'],
  Globe: ['سایت', 'وب', 'جهانی', 'پورتال', 'اینترنت', 'عمومی'],
  ShieldCheck: ['امنیت', 'حفاظت', 'فایروال', 'انتی ویروس', 'تایید'],
  ShieldAlert: ['هشدار امنیتی', 'خطر', 'فایروال'],
  Lock: ['قفل', 'امنیت', 'رمز', 'حفاظت'],
  Key: ['کلید', 'دسترسی', 'رمز عبور', 'مجوز'],
  Terminal: ['ترمینال', 'کنسول', 'خط فرمان', 'اسکریپت', 'دستور'],
  Code: ['کد', 'برنامه نویسی', 'توسعه'],
  Monitor: ['مانیتور', 'نمایشگر', 'صفحه نمایش'],
  Laptop: ['لپتاپ', 'سیستم شخصی'],

  // معدن، صنعت و ماشین‌آلات
  Pickaxe: ['کلنگ', 'معدن', 'استخراج', 'خاکبرداری', 'اکتشاف'],
  Truck: ['کامیون', 'ترابری', 'کمپرسی', 'ماشین الات', 'تراک', 'لودر', 'باربری'],
  Wrench: ['آچار', 'ابزار', 'پشتیبانی', 'تعمیرات', 'سرویس'],
  Hammer: ['چکش', 'ابزار', 'ساخت', 'عمران'],
  Drill: ['دریل', 'حفاری', 'سوراخکاری'],
  Factory: ['کارخانه', 'صنعت', 'تولید', 'مجتمع'],
  Flame: ['کوره', 'ذوب', 'حرارت', 'آتش', 'سوخت'],
  Fuel: ['سوخت', 'گازوئیل', 'بنزین', 'پمپ بنزین', 'انرژی'],
  Boxes: ['انبار', 'جعبه', 'کالا', 'پالت', 'محصولات'],
  Package: ['بسته بندی', 'مرسوله', 'انبارداری', 'دپو'],
  Scale: ['باسکول', 'ترازو', 'وزن', 'سنجش وزن'],
  Cog: ['تنظیمات', 'چرخ دنده', 'فنی', 'مکانیکی'],
  Settings: ['تنظیمات', 'پیکربندی', 'اپشن'],
  Gauge: ['گیج', 'فشار سنج', 'سرعت سنج', 'درجه'],
  Mountain: ['کوه', 'معدن', 'طبیعت', 'توپوگرافی'],
  Gem: ['سنگ', 'گوهر', 'سنگ آهن', 'مواد معدنی'],

  // پایش، دوربین و نظارت تصویری
  Cctv: ['دوربین', 'مداربسته', 'نظارت', 'حراست', 'پایش', 'حفاظت تصویری', 'cctv'],
  Camera: ['دوربین', 'عکس', 'تصویر', 'فیلم'],
  Eye: ['چشم', 'دیدن', 'مشاهده', 'پایش', 'مانیتورینگ'],

  // اداری، پرسنلی و پرتال
  Users: ['کاربران', 'پرسنل', 'کارمندان', 'منابع انسانی', 'اعضا'],
  UserCheck: ['تایید کاربر', 'احراز هویت', 'مجوز پرسنل'],
  UserPlus: ['ثبت نام', 'افزودن کاربر', 'پرسنل جدید'],
  UserCog: ['مدیریت کاربر', 'نقش ها', 'دسترسی ها'],
  Building2: ['ساختمان', 'اداره', 'شرکت', 'دفتر مرکزی'],
  Briefcase: ['امور اداری', 'شغلی', 'پرونده', 'سازمان'],
  IdCard: ['کارت ملی', 'کارت شناسایی', 'پرسنلی', 'هویت'],
  Fingerprint: ['اثر انگشت', 'حضور غیاب', 'ورود و خروج', 'بیومتریک'],
  FileText: ['فایل', 'سند', 'مستندات', 'قرارداد', 'فرم'],
  FileSpreadsheet: ['اکسل', 'شیت', 'جدول', 'آمار'],
  ClipboardList: ['چک لیست', 'وظایف', 'کارها', 'ماموریت'],

  // مالی، حسابداری و حقوق
  CreditCard: ['کارت بانکی', 'پرداخت', 'امور مالی'],
  Coins: ['سکه', 'پول', 'نقدینگی', 'تنخواه'],
  DollarSign: ['دلار', 'ارز', 'مالی', 'هزینه', 'حقوق'],
  Receipt: ['فاکتور', 'قبض', 'رسید', 'حسابداری'],
  Calculator: ['ماشین حساب', 'محاسبات', 'حقوق و دستمزد'],
  Wallet: ['کیف پول', 'بودجه', 'اعتبار'],

  // آمار، گزارش و نمودار
  BarChart3: ['نمودار', 'چارت میله ای', 'گزارش', 'امار'],
  PieChart: ['نمودار دایره ای', 'سهم', 'درصد', 'گزارش'],
  LineChart: ['نمودار خطی', 'روند', 'امار فروش'],
  TrendingUp: ['رشد', 'پیشرفت', 'افزایش تولید', 'شاخص'],
  Activity: ['فعالیت', 'پالس', 'ضربان', 'عملکرد سیستمی'],

  // ارتباطات، نوتیفیکیشن و پیام‌ها
  Bell: ['اعلان', 'نوتیفیکیشن', 'زنگ', 'هشدار', 'خبر'],
  Mail: ['ایمیل', 'نامه', 'مکاتبات', 'صندوق پیام'],
  MessageSquare: ['پیام', 'چت', 'گفتگو', 'نظرات', 'تیکت'],
  Megaphone: ['اعلانات عمومی', 'بخشنامه', 'اطلاعیه'],
  PhoneCall: ['تلفن', 'تماس', 'پشتیبانی', 'داخلی'],

  // عمومی و زمان
  Clock: ['ساعت', 'زمان', 'تایم', 'شیفت کاری'],
  Calendar: ['تقویم', 'تاریخ', 'روزشمار', 'جلسات'],
  MapPin: ['لوکیشن', 'نقشه', 'موقعیت مکانی', 'سایت'],
  QrCode: ['کیوآر', 'بارکد', 'اسکنر'],
  Sliders: ['فیلتر', 'تنظیم کننده', 'شخصی سازی'],
  HelpCircle: ['راهنما', 'پشتیبانی', 'سوالات', 'آموزش']
};

export default function AppEditModal({ isOpen, onClose, onSave, appData }) {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const [displayLimit, setDisplayLimit] = useState(72);

  const [formData, setFormData] = useState({
    titleFa: '',
    titleEn: '',
    url: '',
    desc: '',
    icon: 'Globe',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (appData) {
      setFormData({
        titleFa: appData.titleFa || '',
        titleEn: appData.titleEn || '',
        url: appData.url || appData.href || '',
        desc: appData.desc || '',
        icon: appData.icon || 'Globe',
      });
      setIconSearch('');
      setDisplayLimit(72);
    }
  }, [appData, isOpen]);

  // جستجوی دو زبانه (فارسی و انگلیسی)
  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) return ALL_PORTAL_ICONS;
    const query = iconSearch.toLowerCase().trim();

    return ALL_PORTAL_ICONS.filter((name) => {
      // ۱. جستجوی انگلیسی در نام خود آیکون
      if (name.toLowerCase().includes(query)) return true;

      // ۲. جستجوی فارسی در تگ‌های تعریف شده
      const tags = FA_TAGS[name];
      if (tags && tags.some((tag) => tag.toLowerCase().includes(query))) {
        return true;
      }

      return false;
    });
  }, [iconSearch]);

  const visibleIcons = useMemo(() => {
    return filteredIcons.slice(0, displayLimit);
  }, [filteredIcons, displayLimit]);

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

    showToast(`سامانه «${formData.titleFa.trim()}» با موفقیت ذخیره شد.`, 'success');
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
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-inner">
              <SelectedIcon size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold">ویرایش سامانه</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">تغییر اطلاعات و انتخاب آیکون اختصاصی</p>
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

        {/* فرم */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
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
                placeholder="مثال: مدیریت شبکه و دوربین‌ها"
                required
                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* عنوان انگلیسی */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              شناسه یا عنوان انگلیسی
            </label>
            <input
              type="text"
              dir="ltr"
              value={formData.titleEn}
              onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
              placeholder="e.g. Network & CCTV"
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* آدرس URL */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              آدرس یا آی‌پی سامانه <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Link2 className="absolute right-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                dir="ltr"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="http://192.168.1.15:8080"
                required
                className="w-full pr-9 pl-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* توضیحات */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              توضیحات سامانه
            </label>
            <div className="relative">
              <FileText className="absolute right-3 top-2.5 text-slate-400" size={16} />
              <textarea
                rows={2}
                value={formData.desc}
                onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                placeholder="توضیح کوتاه درباره این سامانه..."
                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 transition-colors resize-none"
              />
            </div>
          </div>

          {/* انتخابگر آیکون دو زبانه */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                انتخاب آیکون ({filteredIcons.length.toLocaleString('fa-IR')} آیکون پیدا شد)
              </label>
              <span className="text-[10px] text-cyan-500 font-mono bg-cyan-500/10 px-2 py-0.5 rounded-md">
                آیکون فعلی: {formData.icon}
              </span>
            </div>

            {/* باکس سرچ فارسی و انگلیسی */}
            <div className="relative mb-2">
              <Search className="absolute right-2.5 top-2 text-slate-400" size={14} />
              <input
                type="text"
                value={iconSearch}
                onChange={(e) => {
                  setIconSearch(e.target.value);
                  setDisplayLimit(72);
                }}
                placeholder="جستجو فارسی یا انگلیسی (مثال: دوربین، سرور، شبکه، معدن، کابل، Server)..."
                className="w-full pr-8 pl-3 py-1.5 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* جعبه رندر آیکون‌ها */}
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5">
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-44 overflow-y-auto pr-1">
                {visibleIcons.length > 0 ? (
                  visibleIcons.map((iconName) => {
                    const ItemIcon = LucideIcons[iconName] || HelpCircle;
                    const isSelected = formData.icon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: iconName })}
                        className={`flex items-center justify-center p-2 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-500 ring-1 ring-cyan-500 scale-105'
                            : 'border-transparent hover:bg-slate-200/60 dark:hover:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                        title={iconName}
                      >
                        <ItemIcon size={18} />
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-full py-4 text-center text-xs text-slate-400">
                    آیکونی با عبارت «{iconSearch}» پیدا نشد.
                  </div>
                )}
              </div>

              {/* دکمه لود بیشتر آیکون‌ها */}
              {visibleIcons.length < filteredIcons.length && (
                <div className="pt-2 text-center border-t border-slate-200/50 dark:border-white/5 mt-2">
                  <button
                    type="button"
                    onClick={() => setDisplayLimit((prev) => prev + 96)}
                    className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                  >
                    نمایش آیکون‌های بیشتر ({filteredIcons.length - visibleIcons.length} آیکون دیگر...)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* دکمه‌های فرم */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-200/60 dark:border-white/10">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/20 active:scale-[0.98]"
            >
              ذخیره سامانه
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
