const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password + 'BAMA_SECRET_KEY')
    .digest('hex');
}

async function main() {
  console.log('در حال ایجاد/به‌روزرسانی داده‌های اولیه...');

  // ایجاد یا به‌روزرسانی کاربر ادمین اصلی
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      fullName: 'مدیر ارشد سیستم',
      department: 'فناوری اطلاعات و ارتباطات',
      password: hashPassword('J13641364'),
      role: 'SUPERADMIN',
    },
    create: {
      username: 'admin',
      fullName: 'مدیر ارشد سیستم',
      department: 'فناوری اطلاعات و ارتباطات',
      password: hashPassword('J13641364'),
      role: 'SUPERADMIN',
    },
  });

  // سامانه‌های پیش‌فرض
  const appsCount = await prisma.application.count();
  if (appsCount === 0) {
    await prisma.application.createMany({
      data: [
        {
          titleFa: 'سامانه حضور و غیاب',
          titleEn: 'Attendance',
          desc: 'ثبت و پیگیری تردد پرسنل',
          icon: 'Clock',
          url: 'http://172.16.1.10',
          href: 'http://172.16.1.10',
          order: 1,
        },
        {
          titleFa: 'سیستم تغذیه و رستوران',
          titleEn: 'Food System',
          desc: 'رزرو غذا و مدیریت وعده‌ها',
          icon: 'UtensilsCrossed',
          url: 'http://172.16.1.11',
          href: 'http://172.16.1.11',
          order: 2,
        },
        {
          titleFa: 'مدیریت دوربین‌ها (CCTV)',
          titleEn: 'CCTV Monitor',
          desc: 'مانیتورینگ و تصاویر نظارتی',
          icon: 'Video',
          url: 'http://172.16.1.12',
          href: 'http://172.16.1.12',
          order: 3,
        },
      ],
    });
  }

  console.log('✅ بذرپاشی داده‌ها با موفقیت انجام شد.');
}

main()
  .catch((e) => {
    console.error('❌ خطا در seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
