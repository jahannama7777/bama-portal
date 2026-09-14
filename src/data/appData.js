import { 
  UtensilsCrossed, Coffee, Home, Palmtree, Bus, Car, Banknote, 
  CreditCard, FileText, Stethoscope, HeartPulse, Dumbbell, Pickaxe, 
  HardHat, Wrench, Laptop, Wifi, Sparkles, Clock, CalendarDays, 
  ShieldAlert, ShieldCheck, PartyPopper, Gift, Info 
} from 'lucide-react';

export const NOTIF_ICON_TYPES = [
  { id: 'food', label: 'رزرو غذا / سلف', icon: UtensilsCrossed, defaultBadge: 'رزرو غذا', color: 'amber' },
  { id: 'coffee', label: 'پذیرایی / کافه', icon: Coffee, defaultBadge: 'پذیرایی', color: 'amber' },
  { id: 'villa', label: 'رزرو ویلا / اقامتگاه', icon: Home, defaultBadge: 'رزرو ویلا', color: 'emerald' },
  { id: 'trip', label: 'گردشگری / تور', icon: Palmtree, defaultBadge: 'امور رفاهی', color: 'emerald' },
  { id: 'bus', label: 'سرویس ایاب و ذهاب', icon: Bus, defaultBadge: 'ترابری', color: 'cyan' },
  { id: 'car', label: 'تردد خودرو / پارکینگ', icon: Car, defaultBadge: 'حمل و نقل', color: 'cyan' },
  { id: 'salary', label: 'حقوق و دستمزد', icon: Banknote, defaultBadge: 'مالی', color: 'emerald' },
  { id: 'payment', label: 'فیش / پاداش و وام', icon: CreditCard, defaultBadge: 'امور مالی', color: 'indigo' },
  { id: 'document', label: 'بخشنامه و قرارداد', icon: FileText, defaultBadge: 'اداری', color: 'blue' },
  { id: 'health', label: 'پزشکی و بهداری', icon: Stethoscope, defaultBadge: 'بهداری / درمان', color: 'rose' },
  { id: 'insurance', label: 'بیمه تکمیلی', icon: HeartPulse, defaultBadge: 'بیمه درمان', color: 'rose' },
  { id: 'sport', label: 'ورزش و استخر', icon: Dumbbell, defaultBadge: 'تربیت بدنی', color: 'teal' },
  { id: 'mine', label: 'عملیات معدنی', icon: Pickaxe, defaultBadge: 'معدن', color: 'amber' },
  { id: 'hse', label: 'ایمنی و بهداشت (HSE)', icon: HardHat, defaultBadge: 'ایمنی HSE', color: 'amber' },
  { id: 'maintenance', label: 'تعمیر و نگهداری', icon: Wrench, defaultBadge: 'فنی / نگهداری', color: 'slate' },
  { id: 'it_system', label: 'سرور و تجهیزات IT', icon: Laptop, defaultBadge: 'فناوری اطلاعات', color: 'cyan' },
  { id: 'network', label: 'شبکه و اینترنت', icon: Wifi, defaultBadge: 'زیرساخت IT', color: 'blue' },
  { id: 'update', label: 'بروزرسانی سیستم', icon: Sparkles, defaultBadge: 'آپدیت سیستم', color: 'cyan' },
  { id: 'shift', label: 'ساعت کاری / شیفت', icon: Clock, defaultBadge: 'شیفت کاری', color: 'purple' },
  { id: 'calendar', label: 'نوبت‌دهی / تقویم', icon: CalendarDays, defaultBadge: 'نوبت‌دهی', color: 'purple' },
  { id: 'security_alert', label: 'هشدار و فوریت', icon: ShieldAlert, defaultBadge: 'حراست / هشدار', color: 'rose' },
  { id: 'security_check', label: 'مجوز و بازرسی', icon: ShieldCheck, defaultBadge: 'انتظامات', color: 'emerald' },
  { id: 'celebration', label: 'مناسبت و جشن', icon: PartyPopper, defaultBadge: 'مناسبت', color: 'pink' },
  { id: 'gift', label: 'هدایا و تسهیلات', icon: Gift, defaultBadge: 'تسهیلات پرسنلی', color: 'violet' },
  { id: 'info', label: 'اطلاعیه عمومی', icon: Info, defaultBadge: 'اطلاعیه عمومی', color: 'blue' },
];

export const allApps = [
  { id: 1, titleFa: 'فایل سرور اداری', titleEn: 'Office File Server', desc: 'مخزن اسناد و فایل‌های عمومی و اداری شرکت', icon: 'Server', url: 'http://192.168.152.110:88', href: 'http://192.168.152.110:88', roles: ['USER', 'ADMIN'] },
  { id: 2, titleFa: 'فایل سرور معدن', titleEn: 'Mine File Server', desc: 'اسناد فنی، نقشه‌ها و داده‌های استخراج معدن', icon: 'Pickaxe', url: 'http://192.200.0.7:80', href: 'http://192.200.0.7:80', roles: ['USER', 'ADMIN'] },
  { id: 3, titleFa: 'فایل سرور مهندسی', titleEn: 'Engineering File Server', desc: 'آرشیو طرح‌ها و مستندات فنی مهندسی', icon: 'Wrench', url: 'http://192.200.0.13:80', href: 'http://192.200.0.13:80', roles: ['USER', 'ADMIN'] },
  { id: 4, titleFa: 'سامانه کسرا قدیم', titleEn: 'Kasra Legacy', desc: 'سیستم قدیمی حضور و غیاب پرسنل', icon: 'Clock', url: 'http://192.200.0.6:8010/Lego.Web/Kevlar/Account/Login', href: 'http://192.200.0.6:8010/Lego.Web/Kevlar/Account/Login', roles: ['USER', 'ADMIN'] },
  { id: 5, titleFa: 'سامانه حضور و غیاب جدید (کسرا)', titleEn: 'Kasra Modern Attendance', desc: 'مدیریت تردد، مرخصی و مأموریت پرسنل', icon: 'UserCheck', url: 'http://app.mineholding.net', href: 'http://app.mineholding.net', roles: ['USER', 'ADMIN'] },
  { id: 6, titleFa: 'اتوماسیون اداری', titleEn: 'Farzin Automation', desc: 'سامانه مکاتبات و گردش اسناد سازمانی', icon: 'Layers', url: 'http://wo.mineholding.net', href: 'http://wo.mineholding.net', roles: ['USER', 'ADMIN'] },
  { id: 7, titleFa: 'سامانه کارمند', titleEn: 'Employee Portal', desc: 'پرتال و خدمات امور پرسنلی و کارمندان', icon: 'UserCheck', url: 'https://sg.bamaco.ir:83', href: 'https://sg.bamaco.ir:83', roles: ['USER', 'ADMIN'] },
  { id: 8, titleFa: 'سامانه دژبان', titleEn: 'Dezhban System', desc: 'پایش و مانیتورینگ دوربین‌های مجموعه', icon: 'ShieldCheck', url: 'http://192.200.0.17:80', href: 'http://192.200.0.17:80', roles: ['USER', 'ADMIN'] },
  { id: 9, titleFa: 'ایمیل سازمانی', titleEn: 'Webmail Service', desc: 'سامانه ارسال و دریافت نامه‌های الکترونیکی', icon: 'Mail', url: 'http://webmail.bamaco.local:443', href: 'http://webmail.bamaco.local:443', roles: ['USER', 'ADMIN'] },
  { id: 10, titleFa: 'سرور PowerBI', titleEn: 'PowerBI Server', desc: 'داشبوردهای هوش تجاری و گزارش‌های تحلیلی', icon: 'BarChart3', url: 'http://192.200.0.12:80/Reports', href: 'http://192.200.0.12:80/Reports', roles: ['USER', 'ADMIN'] },
  { id: 11, titleFa: 'سامانه چت آنلاین', titleEn: 'Internal Chat', desc: 'پیام‌رسان امن و گفت‌وگوی آنی سازمان', icon: 'MessageSquareCode', url: 'http://192.200.0.15:14123', href: 'http://192.200.0.15:14123', roles: ['USER', 'ADMIN'] },
  { id: 12, titleFa: 'پنل اینترنت کاربران', titleEn: 'User Internet Panel', desc: 'مدیریت پهنای باند و حجم اینترنت', icon: 'Wifi', url: 'http://192.200.0.20:80', href: 'http://192.200.0.20:80', roles: ['USER', 'ADMIN'] },
  { id: 13, titleFa: 'لیست ایمیل سازمانی', titleEn: 'Company Directory', desc: 'فهرست آدرس‌ها و پست‌های الکترونیک داخلی', icon: 'Contact', url: 'http://194.150.68.248:9000', href: 'http://194.150.68.248:9000', roles: ['USER', 'ADMIN'] },
  { id: 14, titleFa: 'راهکاران سیستم', titleEn: 'Rahkaran System (ERP)', desc: 'سیستم جامع مالی، انبار و لجستیک', icon: 'Building2', url: 'http://sg.bamaco.ir', href: 'http://sg.bamaco.ir', roles: ['USER', 'ADMIN'] },
  { id: 15, titleFa: 'کتابخانه و دانش', titleEn: 'Knowledge Base', desc: 'بانک استانداردها و آیین‌نامه‌های سازمانی', icon: 'BookOpenCheck', url: 'http://192.200.0.57:8080', href: 'http://192.200.0.57:8080', roles: ['USER', 'ADMIN'] },
  { id: 16, titleFa: 'همیار معدن', titleEn: 'Mine Assistant', desc: 'سامانه مانیتورینگ ماشین‌آلات معدنی', icon: 'Truck', url: 'http://192.200.0.2:80', href: 'http://192.200.0.2:80', roles: ['USER', 'ADMIN'] },
  { id: 17, titleFa: 'سامانه پشتیبانی', titleEn: 'IT Helpdesk', desc: 'ثبت تیکت‌های پشتیبانی IT و درخواست‌های فنی', icon: 'Headphones', url: 'http://192.200.0.25:80/osticket', href: 'http://192.200.0.25:80/osticket', roles: ['USER', 'ADMIN'] }
];
