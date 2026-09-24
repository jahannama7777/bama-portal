# گزارش عیب‌یابی و اصلاح — Bama Portal

این بسته شامل فایل‌های **کامل و آماده جایگزینی** است. ساختار پوشه‌ها دقیقاً با پروژه
شما یکی است، پس می‌توانید محتوای `bama-fix/` را روی ریشه پروژه کپی کنید.

---

## ۰) قبل از هر چیز — دو قدم الزامی

```bash
npm i bcryptjs
npx prisma generate
```

و در `package.json` این سه اصلاح را اعمال کنید:

```jsonc
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",          // ← وجود نداشت؛ بدون آن deploy ممکن نیست
    "start": "next start -p 80",
    "studio": "npx prisma studio",
    "dev:all": "concurrently \"npm run dev\" \"npm run studio\""
  },
  "dependencies": {
    "@prisma/client": "6.4.1",      // ← از devDependencies به اینجا منتقل شود
    "bcryptjs": "^2.4.3",           // ← اضافه شود
    "framer-motion": "^13.4.0",
    "lucide-react": "^1.47.0",
    "next": "16.3.5",
    "react": "19.2.8",
    "react-dom": "19.2.8"
  }
}
```

> `@prisma/client` در `devDependencies` بود. در محیط production که با
> `npm ci --omit=dev` نصب می‌شود، کل بک‌اند با «Cannot find module '@prisma/client'»
> می‌افتد.

---

## ۱) باگ‌های بحرانی که پیدا و رفع شد

| # | باگ | اثر | فایل |
|---|-----|-----|------|
| 1 | مدال به `/api/users/:id/access` درخواست می‌زد، ولی روت زیر `/api/auth/users/...` بود | **همیشه ۴۰۴** — و بدتر: بلوک `catch` تمام سامانه‌ها را `hasAccess: true` می‌گذاشت، پس کاربر Save می‌زد و ناخواسته همه دسترسی‌ها را باز می‌کرد | `UserManagementModal.jsx` |
| 2 | `import { can } from "../../../lib/rbac"` در `src/pages/api/devices/register.js` به `src/lib/rbac` اشاره می‌کرد که **وجود ندارد** (فایل واقعی: `/lib/rbac.ts`) | شکست build با *Module not found* | `register.js` |
| 3 | در `login/route.js`: `user.password === password` — مقایسه **متن ساده** رمز | هر رکوردی که رمزش plain ذخیره شده بود با همان رمت لاگین می‌شد | `login/route.js` |
| 4 | `session/route.js` محتوای کوکی را `JSON.parse` می‌کرد و مستقیم برمی‌گرداند | هر کسی با دستکاری کوکی می‌توانست ادعای نقش `SUPERADMIN` کند | `session/route.js` |
| 5 | `logout/route.js` فقط `bama_auth_session` را پاک می‌کرد | کوکی `bama_session_token` و رکورد `Session` باقی می‌ماند → کاربر واقعاً خارج نمی‌شد | `logout/route.js` |
| 6 | کلاس `dark` هرگز روی `<html>` ست نمی‌شد، در حالی که `globals.css` تعریف کرده: `@custom-variant dark (&:where(.dark, .dark *))` | **تمام صدها کلاس `dark:*` در کل پروژه بی‌اثر بودند** و پورتال همیشه روشن رندر می‌شد | `layout.jsx` |
| 7 | کلاس‌های `animate-in` / `fade-in` / `zoom-in-95` / `slide-in-from-*` استفاده شده بودند ولی پلاگین `tailwindcss-animate` نه نصب بود نه import شده | همه انیمیشن‌های مدال‌ها و توست بی‌صدا کار نمی‌کردند | `globals.css` |
| 8 | `lib/prisma.ts` یک `new PrismaClient()` مستقل می‌ساخت، موازی با singleton موجود در `src/lib/prisma.js` | در dev با hot-reload، ده‌ها کانکشن باز به SQLite | `lib/prisma.ts` |
| 9 | کلاس `custom-scrollbar` در ۵ کامپوننت استفاده شده بود ولی هیچ‌جا تعریف نشده بود | بی‌اثر | `globals.css` |
| 10 | `AuthModals.jsx` از `isLoginModalOpen` / `setIsUserManagementOpen` استفاده می‌کند که **در `AuthContext` وجود ندارند** | کامپوننت مرده و شکسته — هیچ‌جا import نشده | ← **پیشنهاد: حذف شود** |

---

## ۲) ناسازگاری تایپ `Int` / `String` — تحلیل دقیق

شما نوشته بودید شناسه‌ها در `AppsContext.jsx` ترکیبی از `Int` و `app-123` است.
پس از بررسی، وضعیت کمی متفاوت است و مهم است بدانید:

**در `AppsContext.jsx` شناسه رشته‌ای تولید نمی‌شد**، ولی نرمال‌سازی هم نمی‌شد:
`page.jsx` جاهایی `a.id === id` و جاهایی `String(a.id) === String(id)` می‌نوشت؛
یعنی نویسنده کد خودش به وجود ناسازگاری مشکوک بوده. کلید `key={app.id ?? \`app-${index}\`}`
هم همان الگوی `app-123` را وارد کد کرده است.

**ناسازگاری واقعی و فعال در `StatsContext.jsx` بود:**

```js
const DEFAULT_STATS = [{ id: "stat-1", ... }]   // شناسه رشته‌ای ساختگی
```
این رکوردها در دیتابیس وجود ندارند، ولی `updateStat` همین `"stat-1"` را به API
می‌فرستاد و آنجا `Number("stat-1")` = **NaN** می‌شد →
`prisma.stat.update({ where: { id: NaN } })` → خطای ۵۰۰ بی‌صدا.

**و در اندپوینت دسترسی:** `allowedAppIds.includes(app.id)` مقایسه سخت‌گیرانه بود؛
اگر کلاینت `"12"` می‌فرستاد و `app.id` عدد `12` بود، نتیجه `false` می‌شد و
**همه دسترسی‌ها بسته ذخیره می‌شد.**

### راه‌حل اعمال‌شده

یک تابع واحد `toAppId()` که در هر سه لایه تکرار شده (context، مدال، API):

```js
toAppId(12)        // → 12
toAppId("12")      // → 12
toAppId("app-12")  // → 12
toAppId(" 12 ")    // → 12
toAppId("temp")    // → null  (کنار گذاشته می‌شود)
```

علاوه بر آن، در `POST /api/users/:id/access` لیست نهایی با شناسه‌های **واقعی
موجود در جدول `Application`** cross-check می‌شود، پس دیگر هیچ‌وقت خطای
Foreign-Key نخواهید گرفت.

---

## ۳) نکته مهم درباره نقش `PERSONNEL`

شما `PERSONNEL` را جزو نقش‌ها نوشته بودید، ولی در `prisma/schema.prisma` این نقش
**وجود ندارد**. enum واقعی این است:

```prisma
enum Role { SUPERADMIN  ADMIN  SUPERVISOR  USER  GUEST }
```

هم `lib/rbac.ts` و هم UI فعلی، `USER` را با برچسب فارسی **«پرسنل»** نمایش می‌دهند.
بنابراین من روی همین ۵ نقش واقعی کار کردم و چیزی را که در دیتابیس نیست اختراع نکردم.

اگر واقعاً `PERSONNEL` را به‌عنوان نقش مستقل می‌خواهید، سه جا باید تغییر کند:

```prisma
enum Role { SUPERADMIN  ADMIN  SUPERVISOR  PERSONNEL  USER  GUEST }
```
سپس `ROLE_RANK`، `ALL_ROLES` و `ROLE_PERMISSIONS` در `lib/rbac.ts` و در نهایت
`VALID_ROLES` در `api/users/route.js` و `authActions.js`. بگویید تا برایتان بنویسم.

---

## ۴) مهاجرت رمز عبور (SHA-256 → bcrypt)

رمزهای فعلی با `sha256(password + "BAMA_SECRET_KEY")` ذخیره شده‌اند.
اگر مستقیم به bcrypt سوییچ می‌کردیم، **همه کاربران قفل می‌شدند**.

`src/lib/password.js` هر دو را می‌شناسد:
1. اگر هش با `$2a$` / `$2b$` شروع شود → `bcrypt.compare`
2. در غیر این صورت → مقایسه با هش قدیمی SHA-256
3. اگر مسیر (۲) موفق بود، رمز **بی‌صدا و خودکار** به bcrypt ارتقا پیدا می‌کند

یعنی migration بدون هیچ downtime و بدون ریست رمز انجام می‌شود. بعد از اینکه همه
کاربران یک‌بار لاگین کردند، می‌توانید مسیر legacy را حذف کنید.

⚠️ `prisma/seed.js` هنوز از `hashPassword` قدیمی (SHA-256) استفاده می‌کند. این
اشکالی ندارد (مسیر سازگاری آن را می‌پذیرد) ولی بهتر است به این تغییر دهید:

```js
const bcrypt = require('bcryptjs');
function hashPassword(password) { return bcrypt.hashSync(password, 10); }
```

---

## ۵) سیستم توست جدید

- **موقعیت:** پایین-راست دسکتاپ، تمام‌عرض پایین در موبایل
- **استایل:** `backdrop-blur-xl` + حاشیه درخشان + خط نئونی لبه راست + هایلایت شیشه‌ای بالا
- **رنگ‌بندی دقیقاً طبق درخواست:**
  - `success` → `bg-emerald-500/20` + `border-emerald-500/40`
  - `error` → `bg-rose-500/20` + `border-rose-500/40`
  - `warning` → `bg-amber-500/20` + `border-amber-500/40`
  - `info` → `bg-sky-500/20` + `border-sky-500/40`
- **قابلیت‌ها:** بستن خودکار با نوار پیشرفت، مکث تایمر با hover، دکمه بستن صریح،
  عنوان اختیاری، انیمیشن نرم ورود/خروج، سقف ۴ توست هم‌زمان، `role="alert"` برای خطاها

API قدیمی کاملاً حفظ شده — `showToast("متن", "success")` بدون تغییر کار می‌کند.
شکل جدید هم در دسترس است:

```js
showToast({ title: "خطای شبکه", message: "دوباره تلاش کنید", type: "error", duration: 6000 });
error("حذف نشد", { title: "عملیات ناموفق" });
showToast("در حال پردازش...", "info", { duration: 0 });  // چسبان
```

---

## ۶) تغییر ساختار مسیرها (API)

پیاده‌سازی **اصلی** حالا اینجاست:

```
src/app/api/users/route.js              ← GET / POST / PATCH / DELETE
src/app/api/users/[id]/access/route.js  ← GET / POST
```

و مسیرهای قدیمی زیر `auth/` به‌صورت shim فقط re-export می‌کنند، تا اگر جایی از
کد شما هنوز `/api/auth/users` صدا می‌زند، نشکند. بعد از اطمینان می‌توانید
`src/app/api/auth/users/` را کامل حذف کنید.

> ⚠️ `proxy.js` هیچ تغییری لازم ندارد؛ matcher روی `/api/:path*` است و مسیر جدید
> را هم پوشش می‌دهد.

---

## ۷) فایل `tsconfig.json`

پروژه فایل‌های `.ts` دارد (`lib/rbac.ts`, `services/notificationService.ts`) ولی
فقط `jsconfig.json` داشت. وقتی Next.js فایل `.ts` ببیند و `tsconfig.json` نباشد،
خودش یکی می‌سازد که **`paths` شما را ندارد** — و آن لحظه تمام import‌های `@/...`
در کل پروژه می‌شکنند. `tsconfig.json` با همان alias در این بسته آمده است.

---

## ۸) موارد باقی‌مانده که پیشنهاد می‌کنم بررسی کنید

1. **`prisma/migrations/` وجود ندارد** — یعنی با `db push` کار می‌کنید. برای
   production حتماً `npx prisma migrate dev --name init` بزنید تا تاریخچه اسکیما
   داشته باشید.
2. **`.env` داخل zip بود.** اگر در git هم هست، از تاریخچه پاکش کنید.
3. **رمز پیش‌فرض `J13641364`** به‌صورت hard-code در `authActions.js` و `seed.js`
   است و در README گیت‌هاب هم لینک ریپو عمومی دیده می‌شود. حتماً عوضش کنید.
4. **`AuthModals.jsx`** را حذف کنید (کد مرده و شکسته — جدول بالا، ردیف ۱۰).
5. **`prisma.config.ts.bak`** و `.devin/` / `.cursor/` / `.agents/` را از ریپو
   خارج کنید.
6. `lucide-react: ^1.47.0` و `framer-motion: ^13.4.0` — این نسخه‌ها را دوباره
   بررسی کنید؛ `framer-motion` در هیچ کامپوننتی import نشده بود (وابستگی بلااستفاده).

---

## ۹) فهرست فایل‌های این بسته

```
tsconfig.json                                   ← جدید
lib/prisma.ts                                   ← بازنویسی
src/lib/password.js                             ← جدید
src/app/globals.css                             ← بازنویسی
src/app/layout.jsx                              ← اصلاح (کلاس dark)
src/app/actions/authActions.js                  ← بازنویسی
src/app/api/users/route.js                      ← جدید (اصلی)
src/app/api/users/[id]/access/route.js          ← جدید (اصلی)
src/app/api/auth/users/route.js                 ← shim
src/app/api/auth/users/[id]/access/route.js     ← shim
src/app/api/auth/login/route.js                 ← بازنویسی
src/app/api/auth/logout/route.js                ← بازنویسی
src/app/api/auth/session/route.js               ← بازنویسی
src/pages/api/devices/register.js               ← اصلاح import + upsert
src/context/AuthContext.jsx                     ← بازنویسی (+ updateUser)
src/context/AppsContext.jsx                     ← بازنویسی (نرمال‌سازی Int)
src/context/StatsContext.jsx                    ← بازنویسی (رفع NaN)
src/context/ToastContext.jsx                    ← بازنویسی
src/components/ui/ToastContainer.jsx            ← بازنویسی
src/components/auth/UserManagementModal.jsx     ← بازنویسی کامل
```
