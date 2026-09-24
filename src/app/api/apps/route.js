/**
 * File: src/app/api/apps/route.js
 *
 * ⚠️ این فایل در پروژه شما به‌اشتباه با محتوای روت
 *    src/app/api/users/[id]/access/route.js
 * جایگزین شده بود. نتیجه: GET /api/apps به‌جای لیست سامانه‌ها،
 * کد ۴۰۰ با پیام «شناسه کاربر نامعتبر است.» برمی‌گرداند و داشبورد خالی می‌ماند.
 *
 * علاوه بر بازگرداندن محتوای درست، یک باگ منطقی هم رفع شده:
 *
 *   قبلاً سرور apps را فیلتر می‌کرد ولی فیلد `userAllowed` را به کلاینت
 *   نمی‌فرستاد. page.jsx دوباره همان لیست را با canAccessApp(user, app)
 *   فیلتر می‌کرد و چون `userAllowed` نبود، فقط نقش app.roles را می‌دید.
 *   برای کاربری با نقش SUPERVISOR که تمام سامانه‌هایش در UserAppAccess
 *   مجاز شده بود ولی roles سامانه‌ها ["USER","ADMIN"] است،
 *   ⇒ سرور ۱۷ سامانه می‌فرستاد و کلاینت هر ۱۷ تا را دور می‌ریخت.
 *
 *   حالا هر سامانه با `userAllowed: true` برمی‌گردد، پس فیلتر سمت کلاینت
 *   با تصمیم سرور هم‌نظر می‌شود و دیگر دوباره‌کاری نمی‌کند.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireAuth, can, canAccessApp } from "@/src/lib/apiGuards";

/* -------------------------------------------------------------------- GET */

export async function GET() {
  try {
    const { user } = await requireAuth({ allowGuest: true });

    // GUEST یا کاربر ناشناس → فقط نمای کلی، بدون سامانه
    if (!user || can.isGuest(user)) {
      return NextResponse.json([], { status: 200 });
    }

    const apps = await prisma.application.findMany({
      orderBy: [{ order: "asc" }, { id: "asc" }],
    });

    // دسترسی‌های اختصاصی کاربر (UserAppAccess)
    let accessMap = new Map();
    try {
      const overrides = await prisma.userAppAccess.findMany({
        where: { userId: user.id },
        select: { appId: true, allowed: true },
      });
      accessMap = new Map(overrides.map((o) => [o.appId, o.allowed]));
    } catch (e) {
      console.warn("UserAppAccess query warning:", e?.message);
    }

    const visible = apps
      .filter((app) =>
        canAccessApp(user, {
          id: app.id,
          roles: app.roles,
          userAllowed: accessMap.has(app.id) ? accessMap.get(app.id) : null,
        }),
      )
      .map((app) => ({
        ...app,
        // تصمیم نهایی سرور، تا کلاینت دوباره بر اساس نقش فیلتر نکند
        userAllowed: true,
      }));

    return NextResponse.json(visible, { status: 200 });
  } catch (error) {
    console.error("GET /api/apps Error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت سامانه‌ها" },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------------- POST */

export async function POST(req) {
  try {
    const { error } = await requireAuth({ permission: "MANAGE_APPS" });
    if (error) return error;

    const body = await req.json();
    const { id, titleFa, titleEn, desc, icon, url, href, roles, order } = body;

    const displayTitle = titleFa || "سامانه جدید";
    const appUrl = url || href || "#";

    if (id) {
      const appId = Number(id);
      if (!Number.isInteger(appId) || appId <= 0) {
        return NextResponse.json(
          { error: "شناسه سامانه نامعتبر است" },
          { status: 400 },
        );
      }

      const updated = await prisma.application.update({
        where: { id: appId },
        data: {
          titleFa: displayTitle,
          titleEn: titleEn || null,
          desc: desc || null,
          icon: icon || "Globe",
          url: appUrl,
          href: href || appUrl,
          ...(roles !== undefined
            ? {
                roles:
                  typeof roles === "string" ? roles : JSON.stringify(roles),
              }
            : {}),
          ...(order !== undefined ? { order: Number(order) } : {}),
        },
      });
      return NextResponse.json(updated, { status: 200 });
    }

    const created = await prisma.application.create({
      data: {
        titleFa: displayTitle,
        titleEn: titleEn || null,
        desc: desc || null,
        icon: icon || "Globe",
        url: appUrl,
        href: href || appUrl,
        ...(roles !== undefined
          ? {
              roles: typeof roles === "string" ? roles : JSON.stringify(roles),
            }
          : {}),
        ...(order !== undefined ? { order: Number(order) } : {}),
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/apps Error:", error);
    return NextResponse.json({ error: "خطا در ذخیره سامانه" }, { status: 500 });
  }
}

/* ----------------------------------------------------------------- DELETE */

export async function DELETE(req) {
  try {
    const { error } = await requireAuth({ permission: "MANAGE_APPS" });
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const id = Number.parseInt(searchParams.get("id"), 10);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "شناسه ارسال نشده یا نامعتبر است" },
        { status: 400 },
      );
    }

    // ردیف‌های UserAppAccess با onDelete: Cascade خودکار پاک می‌شوند
    await prisma.application.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/apps Error:", error);
    return NextResponse.json({ error: "خطا در حذف سامانه" }, { status: 500 });
  }
}
