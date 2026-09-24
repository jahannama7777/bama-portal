/**
 * File: src/lib/password.js
 *
 * لایه واحد هش/بررسی رمز عبور برای کل پروژه.
 *
 * - رمزهای جدید همیشه با bcrypt ساخته می‌شوند (10 rounds).
 * - رمزهای قدیمی که با SHA-256 + BAMA_SECRET_KEY ساخته شده بودند همچنان
 *   پذیرفته می‌شوند تا کاربران فعلی قفل نشوند، و هنگام اولین ورود موفق
 *   به‌صورت خودکار به bcrypt ارتقا پیدا می‌کنند (needsRehash).
 * - مقایسه متن ساده (plain-text) که در login route قبلی وجود داشت
 *   به‌طور کامل حذف شده است؛ آن یک حفره امنیتی جدی بود.
 *
 * پیش‌نیاز:  npm i bcryptjs
 */

import bcrypt from "bcryptjs";
import crypto from "crypto";

const BCRYPT_ROUNDS = 10;
const LEGACY_SALT = "BAMA_SECRET_KEY";

/** هش قدیمی SHA-256 — فقط برای تشخیص رمزهای موجود در دیتابیس */
export function legacyHash(password) {
  return crypto
    .createHash("sha256")
    .update(String(password) + LEGACY_SALT)
    .digest("hex");
}

/** آیا این رشته یک هش bcrypt است؟ */
export function isBcryptHash(value) {
  return typeof value === "string" && /^\$2[aby]\$\d{2}\$/.test(value);
}

/**
 * ساخت هش جدید (همیشه bcrypt).
 * @param {string} plain
 * @returns {Promise<string>}
 */
export async function hashPassword(plain) {
  return bcrypt.hash(String(plain), BCRYPT_ROUNDS);
}

/** نسخه همگام، برای اسکریپت seed */
export function hashPasswordSync(plain) {
  return bcrypt.hashSync(String(plain), BCRYPT_ROUNDS);
}

/**
 * بررسی رمز عبور در برابر هش ذخیره‌شده.
 * @param {string} plain رمز واردشده توسط کاربر
 * @param {string} stored مقدار ستون password در دیتابیس
 * @returns {Promise<{ ok: boolean, needsRehash: boolean }>}
 */
export async function verifyPassword(plain, stored) {
  if (!plain || !stored) return { ok: false, needsRehash: false };

  if (isBcryptHash(stored)) {
    const ok = await bcrypt.compare(String(plain), stored);
    return { ok, needsRehash: false };
  }

  // مسیر سازگاری با رمزهای SHA-256 قدیمی
  const ok = legacyHash(plain) === stored;
  return { ok, needsRehash: ok };
}

/**
 * اعتبارسنجی حداقلی رمز عبور هنگام ایجاد/تغییر.
 * @returns {{ valid: boolean, message?: string }}
 */
export function validatePasswordStrength(plain) {
  const value = String(plain || "");
  if (value.length < 6) {
    return { valid: false, message: "رمز عبور باید حداقل ۶ کاراکتر باشد." };
  }
  if (value.length > 72) {
    // محدودیت ذاتی bcrypt
    return { valid: false, message: "رمز عبور نباید بیش از ۷۲ کاراکتر باشد." };
  }
  return { valid: true };
}
