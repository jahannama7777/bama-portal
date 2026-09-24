/**
 * File: src/app/api/auth/logout/route.js
 *
 * باگ نسخه قبلی: فقط کوکی bama_auth_session پاک می‌شد و رکورد Session در
 * دیتابیس و کوکی bama_session_token دست‌نخورده باقی می‌ماند — یعنی کاربر
 * عملاً از سیستم خارج نمی‌شد.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { SESSION_TOKEN_COOKIE, SESSION_JSON_COOKIE } from "@/src/lib/session";

export async function POST(req) {
  try {
    const token = req.cookies.get(SESSION_TOKEN_COOKIE)?.value;

    if (token) {
      await prisma.session.deleteMany({ where: { token } }).catch(() => {});
    }

    const res = NextResponse.json({ success: true });
    res.cookies.delete(SESSION_TOKEN_COOKIE);
    res.cookies.delete(SESSION_JSON_COOKIE);
    return res;
  } catch (error) {
    console.error("POST /api/auth/logout Error:", error);
    const res = NextResponse.json({ success: true });
    res.cookies.delete(SESSION_TOKEN_COOKIE);
    res.cookies.delete(SESSION_JSON_COOKIE);
    return res;
  }
}
