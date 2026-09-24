/**
 * File: src/app/api/admin/active-sessions/route.js
 */

import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireAuth } from "@/src/lib/apiGuards";

export async function GET(req) {
  try {
    // بررسی احراز هویت ادمین
    const auth = await requireAuth(req, { permission: "MANAGE_USERS" });
    if (auth?.error) return auth.error;

    const now = new Date();

    // خواندن نشست‌های منقضی‌نشده از جدول Session به همراه کاربر
    const activeSessions = await prisma.session.findMany({
      where: {
        expiresAt: {
          gt: now,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            department: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // تجمیع نشست‌ها بر اساس کاربر (کاربرانی که در چند تب/دستگاه فعال هستند)
    const userMap = new Map();

    for (const session of activeSessions) {
      if (!session.user) continue;

      const uid = session.user.id;
      if (!userMap.has(uid)) {
        userMap.set(uid, {
          user: session.user,
          deviceCount: 1,
          firstLogin: session.createdAt,
          lastExpiresAt: session.expiresAt,
          sessionIds: [session.id],
        });
      } else {
        const item = userMap.get(uid);
        item.deviceCount += 1;
        item.sessionIds.push(session.id);
        if (session.createdAt < item.firstLogin) {
          item.firstLogin = session.createdAt;
        }
      }
    }

    const users = Array.from(userMap.values());

    return NextResponse.json({
      success: true,
      totalActiveSessions: activeSessions.length,
      onlineUsersCount: users.length,
      users,
    });
  } catch (err) {
    console.error("GET /api/admin/active-sessions error:", err);
    return NextResponse.json(
      { error: "خطا در واکشی نشست‌های فعال" },
      { status: 500 }
    );
  }
}

// خاتمه دادن اجباری به نشست‌های یک کاربر (Kick Session)
export async function DELETE(req) {
  try {
    const auth = await requireAuth(req, { permission: "MANAGE_USERS" });
    if (auth?.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "شناسه کاربر الزامی است" }, { status: 400 });
    }

    await prisma.session.deleteMany({
      where: { userId: Number(userId) },
    });

    return NextResponse.json({
      success: true,
      message: "تمام نشست‌های کاربر با موفقیت حذف گردید.",
    });
  } catch (err) {
    console.error("DELETE /api/admin/active-sessions error:", err);
    return NextResponse.json(
      { error: "خطا در خاتمه نشست کاربر" },
      { status: 500 }
    );
  }
}
