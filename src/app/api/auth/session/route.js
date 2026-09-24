/**
 * File: src/app/api/auth/session/route.js
 *
 * باگ نسخه قبلی: محتوای کوکی را مستقیماً JSON.parse می‌کرد و به کلاینت
 * برمی‌گرداند. یعنی هر کسی با دستکاری کوکی می‌توانست ادعای نقش SUPERADMIN کند.
 * حالا هویت از روی رکورد Session در دیتابیس بازخوانی می‌شود.
 */

import { NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/src/lib/session";

export async function GET(req) {
  try {
    const user = await getCurrentUserFromRequest(req);
    return NextResponse.json({ user: user || null }, { status: 200 });
  } catch (error) {
    console.error("GET /api/auth/session Error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
