const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initialApps = [
  { titleFa: "سامانه اتوماسیون اداری", titleEn: "Automation", url: "http://192.200.0.10", icon: "FileText", category: "اداری", color: "from-blue-600 to-cyan-500", sortOrder: 1 },
  { titleFa: "سامانه ERP و مالی", titleEn: "ERP System", url: "http://192.200.0.11", icon: "DollarSign", category: "مالی", color: "from-emerald-600 to-teal-500", sortOrder: 2 },
  { titleFa: "سامانه انبارداری و کالا", titleEn: "Warehouse", url: "http://192.200.0.12", icon: "Package", category: "لجستیک", color: "from-amber-600 to-orange-500", sortOrder: 3 },
  { titleFa: "سامانه منابع انسانی (HR)", titleEn: "HR Management", url: "http://192.200.0.13", icon: "Users", category: "اداری", color: "from-purple-600 to-indigo-500", sortOrder: 4 },
  { titleFa: "سامانه حضور و غیاب", titleEn: "Time Attendance", url: "http://192.200.0.14", icon: "Clock", category: "اداری", color: "from-sky-600 to-blue-500", sortOrder: 5 },
  { titleFa: "سامانه رزرو غذا", titleEn: "Food Reservation", url: "http://192.200.0.15", icon: "Utensils", category: "رفاهی", color: "from-rose-600 to-red-500", sortOrder: 6 },
  { titleFa: "سامانه تیکتینگ و پشتیبانی IT", titleEn: "Helpdesk IT", url: "http://192.200.0.16", icon: "LifeBuoy", category: "فناوری اطلاعات", color: "from-violet-600 to-purple-500", sortOrder: 7 },
  { titleFa: "سامانه مانیتورینگ دوربین (CCTV)", titleEn: "CCTV Monitor", url: "http://192.200.0.17", icon: "Camera", category: "حراست", color: "from-slate-700 to-zinc-800", sortOrder: 8 },
  { titleFa: "سامانه مدیریت اموال و دارایی", titleEn: "Asset Management", url: "http://192.200.0.18", icon: "Boxes", category: "مالی", color: "from-teal-600 to-emerald-500", sortOrder: 9 },
  { titleFa: "سامانه ایمیل سازمانی", titleEn: "Webmail", url: "http://mail.bama.ir", icon: "Mail", category: "ارتباطات", color: "from-cyan-600 to-blue-600", sortOrder: 10 },
  { titleFa: "سامانه کنترل تردد و گیت", titleEn: "Access Control", url: "http://192.200.0.19", icon: "Shield", category: "حراست", color: "from-red-600 to-rose-700", sortOrder: 11 },
  { titleFa: "سامانه مدیریت تولید و کارخانه", titleEn: "Production Line", url: "http://192.200.0.20", icon: "Factory", category: "تولید", color: "from-orange-600 to-amber-600", sortOrder: 12 },
  { titleFa: "سامانه آزمایشگاه و کنترل کیفیت (QC)", titleEn: "Quality Control", url: "http://192.200.0.21", icon: "FlaskConical", category: "تولید", color: "from-lime-600 to-emerald-600", sortOrder: 13 },
  { titleFa: "سامانه آموزش پرسنل", titleEn: "LMS Portal", url: "http://192.200.0.22", icon: "GraduationCap", category: "منابع انسانی", color: "from-indigo-600 to-blue-700", sortOrder: 14 },
  { titleFa: "سامانه نقلیه و ترابری", titleEn: "Fleet Management", url: "http://192.200.0.23", icon: "Truck", category: "لجستیک", color: "from-yellow-600 to-amber-700", sortOrder: 15 },
  { titleFa: "سامانه مدیریت اسناد و آرشیو", titleEn: "Document Archive", url: "http://192.200.0.24", icon: "FolderArchive", category: "اداری", color: "from-fuchsia-600 to-pink-600", sortOrder: 16 },
  { titleFa: "سامانه ارزیابی عملکرد کارکنان", titleEn: "KPI & Appraisal", url: "http://192.200.0.25", icon: "TrendingUp", category: "منابع انسانی", color: "from-emerald-500 to-teal-700", sortOrder: 17 }
];

async function main() {
  console.log('--- پاکسازی و وارد کردن داده‌های اولیه سامانه‌ها ---');
  await prisma.application.deleteMany();

  for (const app of initialApps) {
    await prisma.application.create({
      data: app
    });
  }

  console.log('✅ ۱۷ سامانه با موفقیت در دیتابیس ثبت شدند.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
