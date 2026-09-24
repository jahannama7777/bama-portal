/**
 * File: src/app/api/users/[id]/access/route.js
 *
 * اندپوینت اصلی مدیریت دسترسی کاربر به سامانه‌ها.
 *
 * نکته مهم درباره‌ی ناسازگاری تایپ:
 *   در Prisma هم `Application.id` و هم `UserAppAccess.appId` از نوع Int هستند،
 *   ولی فرانت‌اند ممکن است شناسه را به شکل رشته ("12") یا شناسه موقت
 *   ("app-12" / "temp-…") بفرستد. تابع toAppId زیر تمام این حالات را به Int
 *   تبدیل می‌کند و هر شناسه‌ای که قابل تبدیل نباشد کنار گذاشته می‌شود.
 *   در نهایت لیست نهایی با شناسه‌های واقعی موجود در دیتابیس cross-check می‌شود،
 *   بنابراین هرگز خطای Foreign-Key نخواهید گرفت.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireAuth } from "@/src/lib/apiGuards";

const DEFAULT_ROLES = ["USER", "ADMIN", "SUPERADMIN", "SUPERVISOR"];

/**
 * هر ورودی را به شناسه عددی معتبر تبدیل می‌کند، یا null برمی‌گرداند.
 * پشتیبانی‌شده: 12 | "12" | "app-12" | " 12 " | { id: 12 }
 * @param {unknown} value
 * @returns {number|null}
 */
function toAppId(value) {
  if (value === null || value === undefined) return null;

  if (typeof value === "object") {
    return toAppId(value.id ?? value.appId ?? null);
  }

  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? value : null;
  }

  const raw = String(value).trim();
  if (!raw) return null;

  // "app-12" → "12" ، "12" → "12"
  const match = raw.match(/(\d+)\s*$/);
  if (!match) return null;

  const parsed = Number.parseInt(match[1], 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

/** roles ذخیره‌شده به‌صورت رشته JSON را به آرایه تبدیل می‌کند */
function parseAppRoles(roles) {
  if (!roles) return DEFAULT_ROLES;
  if (Array.isArray(roles)) return roles;

  try {
    const parsed = JSON.parse(roles);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return String(roles)
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
  }
  return DEFAULT_ROLES;
}

/**
 * GET /api/users/:id/access
 * خروجی: { user, apps: [{ id, titleFa, ..., hasAccess, isCustom }], allowedAppIds }
 */
export async function GET(request, { params }) {
  try {
    const { error } = await requireAuth({ permission: "APPLY_USER_RESTRICTIONS" });
    if (error) return error;

    const resolvedParams = await params;
    const targetUserId = Number.parseInt(resolvedParams?.id, 10);

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return NextResponse.json(
        { success: false, message: "شناسه کاربر نامعتبر است." },
        { status: 400 },
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        username: true,
        fullName: true,
        department: true,
        role: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "کاربر مورد نظر یافت نشد." },
        { status: 404 },
      );
    }

    const [allApps, userAccessList] = await Promise.all([
      prisma.application.findMany({ orderBy: [{ order: "asc" }, { id: "asc" }] }),
      prisma.userAppAccess.findMany({
        where: { userId: targetUserId },
        select: { appId: true, allowed: true },
      }),
    ]);

    // کلیدهای Map همیشه Int هستند چون appId در اسکیما Int است
    const accessMap = new Map(userAccessList.map((a) => [a.appId, a.allowed]));

    const apps = allApps.map((app) => {
      const allowedRoles = parseAppRoles(app.roles);
      const roleAllowed =
        targetUser.role === "SUPERADMIN" || allowedRoles.includes(targetUser.role);

      const custom = accessMap.get(app.id);
      const hasAccess = custom === undefined ? roleAllowed : custom;

      return {
        id: app.id,
        titleFa: app.titleFa,
        titleEn: app.titleEn,
        desc: app.desc,
        icon: app.icon,
        url: app.url || app.href || "#",
        order: app.order,
        roles: allowedRoles,
        roleAllowed,
        hasAccess,
        isCustom: custom !== undefined,
      };
    });

    return NextResponse.json({
      success: true,
      user: targetUser,
      apps,
      allowedAppIds: apps.filter((a) => a.hasAccess).map((a) => a.id),
    });
  } catch (err) {
    console.error("GET /api/users/[id]/access Error:", err);
    return NextResponse.json(
      { success: false, message: "خطای سرور در دریافت دسترسی‌ها." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/users/:id/access
 * بدنه پذیرفته‌شده (هر کدام از این دو شکل):
 *   { allowedAppIds: [1, "2", "app-3"] }
 *   { apps: [{ id: 1, hasAccess: true }, ...] }
 */
export async function POST(request, { params }) {
  try {
    const { user, error } = await requireAuth({
      permission: "APPLY_USER_RESTRICTIONS",
    });
    if (error) return error;

    const resolvedParams = await params;
    const targetUserId = Number.parseInt(resolvedParams?.id, 10);

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return NextResponse.json(
        { success: false, message: "شناسه کاربر نامعتبر است." },
        { status: 400 },
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "بدنه درخواست معتبر نیست." },
        { status: 400 },
      );
    }

    // --- نرمال‌سازی ورودی به آرایه‌ای از Int ---
    let rawIds;
    if (Array.isArray(body?.allowedAppIds)) {
      rawIds = body.allowedAppIds;
    } else if (Array.isArray(body?.apps)) {
      rawIds = body.apps.filter((a) => a?.hasAccess).map((a) => a?.id);
    } else {
      return NextResponse.json(
        {
          success: false,
          message:
            "فرمت داده‌های ارسالی نامعتبر است. allowedAppIds یا apps باید آرایه باشد.",
        },
        { status: 400 },
      );
    }

    const requestedIds = new Set(
      rawIds.map(toAppId).filter((id) => id !== null),
    );

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, fullName: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "کاربر مورد نظر یافت نشد." },
        { status: 404 },
      );
    }

    // سوپرادمین نباید توسط ادمین معمولی محدود شود
    if (targetUser.role === "SUPERADMIN" && user.role !== "SUPERADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "تغییر دسترسی‌های مدیر ارشد فقط توسط سوپرادمین ممکن است.",
        },
        { status: 403 },
      );
    }

    // فقط شناسه‌هایی که واقعاً در جدول Application هستند (ضد Foreign-Key error)
    const allApps = await prisma.application.findMany({ select: { id: true } });
    const validIds = allApps.map((a) => a.id);
    const allowedSet = new Set(validIds.filter((id) => requestedIds.has(id)));

    const accessData = validIds.map((appId) => ({
      userId: targetUserId,
      appId, // تضمیناً Int — مستقیماً از دیتابیس آمده
      allowed: allowedSet.has(appId),
    }));

    // ذخیره اتمیک: یا همه اعمال می‌شود یا هیچ‌کدام
    await prisma.$transaction(async (tx) => {
      await tx.userAppAccess.deleteMany({ where: { userId: targetUserId } });

      if (accessData.length > 0) {
        await tx.userAppAccess.createMany({ data: accessData });
      }
    });

    return NextResponse.json({
      success: true,
      message: `دسترسی‌های «${targetUser.fullName}» با موفقیت ذخیره شد.`,
      allowedAppIds: [...allowedSet],
      totalApps: validIds.length,
    });
  } catch (err) {
    console.error("POST /api/users/[id]/access Error:", err);
    return NextResponse.json(
      { success: false, message: "خطا در ثبت تغییرات دسترسی." },
      { status: 500 },
    );
  }
}
