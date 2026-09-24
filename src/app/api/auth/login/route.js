/**
 * File: src/app/api/auth/login/route.js
 *
 * اصلاحات نسبت به نسخه قبلی:
 *  1. مقایسه متن ساده رمز (`user.password === password`) حذف شد — حفره امنیتی جدی.
 *  2. bcrypt جایگزین SHA-256 شد، با ارتقای خودکار رمزهای قدیمی.
 *  3. به‌جای ریختن کل آبجکت کاربر داخل کوکی، یک Session واقعی در دیتابیس ساخته
 *     می‌شود و فقط توکن در کوکی bama_session_token قرار می‌گیرد — دقیقاً همان
 *     استراتژی‌ای که authActions.js استفاده می‌کند. بنابراین هر دو مسیر ورود
 *     (Server Action و REST) به یک سشن واحد می‌رسند.
 */

import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/src/lib/prisma";
import { verifyPassword, hashPassword } from "@/src/lib/password";
import { SESSION_TOKEN_COOKIE, SESSION_JSON_COOKIE } from "@/src/lib/session";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // ۷ روز

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "بدنه درخواست معتبر نیست." },
        { status: 400 },
      );
    }

    const username = String(body?.username || "").trim();
    const password = String(body?.password || "").trim();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "نام کاربری و کلمه عبور الزامی است." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { username } });

    // پیام یکسان برای «کاربر نیست» و «رمز غلط» تا اطلاعات لو نرود
    const invalid = NextResponse.json(
      { success: false, message: "نام کاربری یا رمز عبور اشتباه است." },
      { status: 401 },
    );

    if (!user) return invalid;

    const { ok, needsRehash } = await verifyPassword(password, user.password);
    if (!ok) return invalid;

    // ارتقای شفاف رمزهای SHA-256 قدیمی به bcrypt
    if (needsRehash) {
      await prisma.user
        .update({
          where: { id: user.id },
          data: { password: await hashPassword(password) },
        })
        .catch(() => {});
    }

    const sessionToken = crypto.randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    // پاکسازی سشن‌های منقضی همان کاربر
    await prisma.session
      .deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } })
      .catch(() => {});

    await prisma.session.create({
      data: { token: sessionToken, userId: user.id, expiresAt },
    });

    const safeUser = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      department: user.department,
      role: user.role,
    };

    const res = NextResponse.json({ success: true, user: safeUser });

    res.cookies.set(SESSION_TOKEN_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    // کوکی JSON قدیمی اگر باقی مانده باشد پاک می‌شود تا دو منبع حقیقت نداشته باشیم
    res.cookies.delete(SESSION_JSON_COOKIE);

    return res;
  } catch (error) {
    console.error("POST /api/auth/login Error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور در فرایند ورود." },
      { status: 500 },
    );
  }
}
