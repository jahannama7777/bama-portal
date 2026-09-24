/**
 * File: lib/prisma.ts
 *
 * باگ نسخه قبلی: این فایل یک `new PrismaClient()` مستقل می‌ساخت، در حالی که
 * src/lib/prisma.js هم یک نمونه singleton دارد. در حالت dev با hot-reload
 * نتیجه‌اش ده‌ها کانکشن باز به SQLite و خطاهای متناوب بود.
 * حالا همان singleton واحد re-export می‌شود (با مسیر نسبی، تا وابسته به alias نباشد).
 */

export { prisma, prisma as default } from "../src/lib/prisma";
