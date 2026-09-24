/**
 * File: src/app/api/users/route.js
 *
 * مدیریت کامل کاربران: لیست / ایجاد / ویرایش / حذف
 *
 *   GET    /api/users            → لیست کاربران (بدون رمز)
 *   POST   /api/users            → ایجاد کاربر جدید
 *   PATCH  /api/users            → ویرایش کاربر (body.id الزامی)
 *   DELETE /api/users?id=12      → حذف کاربر
 *
 * قواعد امنیتی اعمال‌شده:
 *  - همه متدها نیازمند مجوز MANAGE_USERS هستند.
 *  - تخصیص نقش با canCreateRole کنترل می‌شود (ادمین نمی‌تواند سوپرادمین بسازد).
 *  - کاربر نمی‌تواند نقش خودش را تغییر دهد یا خودش را حذف کند.
 *  - ادمین نمی‌تواند روی کاربری با رتبه بالاتر یا برابر خودش تغییر ایجاد کند
 *    (سوپرادمین از این قاعده مستثناست).
 *  - رمز عبور همیشه با bcrypt هش می‌شود و هرگز در پاسخ برنمی‌گردد.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireAuth, can, canCreateRole } from "@/src/lib/apiGuards";
import { hashPassword, validatePasswordStrength } from "@/src/lib/password";

const VALID_ROLES = ["SUPERADMIN", "ADMIN", "SUPERVISOR", "USER", "GUEST"];
const ROLE_RANK = { GUEST: 0, USER: 1, SUPERVISOR: 2, ADMIN: 3, SUPERADMIN: 4 };

const PUBLIC_USER_SELECT = {
  id: true,
  username: true,
  fullName: true,
  department: true,
  role: true,
  createdAt: true,
};

function rank(role) {
  return ROLE_RANK[role] ?? 0;
}

/** آیا actor اجازه دست‌کاری حساب target را دارد؟ */
function canManageTarget(actor, target) {
  if (actor.role === "SUPERADMIN") return true;
  return rank(actor.role) > rank(target.role);
}

function fail(message, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

/* ------------------------------------------------------------------ GET */

export async function GET() {
  try {
    const { error } = await requireAuth({ permission: "MANAGE_USERS" });
    if (error) return error;

    const users = await prisma.user.findMany({
      select: PUBLIC_USER_SELECT,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (err) {
    console.error("GET /api/users Error:", err);
    return fail("خطا در دریافت لیست کاربران.", 500);
  }
}

/* ----------------------------------------------------------------- POST */

export async function POST(req) {
  try {
    const { user: actor, error } = await requireAuth({
      permission: "MANAGE_USERS",
    });
    if (error) return error;

    let body;
    try {
      body = await req.json();
    } catch {
      return fail("بدنه درخواست معتبر نیست.");
    }

    const username = String(body?.username || "").trim();
    const fullName = String(body?.fullName || "").trim();
    const department = String(body?.department || "").trim() || "عمومی";
    const password = String(body?.password || "");
    const role = String(body?.role || "USER").toUpperCase();

    if (!username || !fullName || !password) {
      return fail("نام، نام کاربری و رمز عبور الزامی است.");
    }

    if (!/^[A-Za-z0-9._-]{3,32}$/.test(username)) {
      return fail(
        "نام کاربری باید بین ۳ تا ۳۲ کاراکتر و فقط شامل حروف انگلیسی، عدد، نقطه، خط تیره و آندرلاین باشد.",
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return fail("نقش انتخاب‌شده معتبر نیست.");
    }

    const strength = validatePasswordStrength(password);
    if (!strength.valid) return fail(strength.message);

    if (!canCreateRole(actor, role)) {
      return fail("شما مجاز به ایجاد کاربر با این نقش نیستید.", 403);
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return fail("این نام کاربری قبلاً ثبت شده است.", 409);
    }

    const created = await prisma.user.create({
      data: {
        username,
        fullName,
        department,
        password: await hashPassword(password),
        role,
      },
      select: PUBLIC_USER_SELECT,
    });

    return NextResponse.json(
      {
        success: true,
        message: `حساب کاربری «${created.fullName}» ایجاد شد.`,
        user: created,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/users Error:", err);
    if (err?.code === "P2002") {
      return fail("این نام کاربری قبلاً ثبت شده است.", 409);
    }
    return fail("خطا در ایجاد کاربر.", 500);
  }
}

/* ---------------------------------------------------------------- PATCH */

export async function PATCH(req) {
  try {
    const { user: actor, error } = await requireAuth({
      permission: "MANAGE_USERS",
    });
    if (error) return error;

    let body;
    try {
      body = await req.json();
    } catch {
      return fail("بدنه درخواست معتبر نیست.");
    }

    const id = Number.parseInt(body?.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
      return fail("شناسه کاربر نامعتبر است.");
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, role: true, fullName: true },
    });
    if (!target) return fail("کاربر مورد نظر یافت نشد.", 404);

    if (actor.id !== target.id && !canManageTarget(actor, target)) {
      return fail("شما مجاز به ویرایش این حساب نیستید.", 403);
    }

    /** @type {Record<string, unknown>} */
    const data = {};

    if (body.fullName !== undefined) {
      const fullName = String(body.fullName).trim();
      if (!fullName) return fail("نام و نام خانوادگی نمی‌تواند خالی باشد.");
      data.fullName = fullName;
    }

    if (body.department !== undefined) {
      data.department = String(body.department).trim() || "عمومی";
    }

    if (body.username !== undefined) {
      const username = String(body.username).trim();
      if (!/^[A-Za-z0-9._-]{3,32}$/.test(username)) {
        return fail("قالب نام کاربری معتبر نیست.");
      }
      if (username !== target.username) {
        const clash = await prisma.user.findUnique({ where: { username } });
        if (clash) return fail("این نام کاربری قبلاً ثبت شده است.", 409);
        data.username = username;
      }
    }

    if (body.role !== undefined) {
      const role = String(body.role).toUpperCase();
      if (!VALID_ROLES.includes(role)) return fail("نقش انتخاب‌شده معتبر نیست.");

      if (actor.id === target.id && role !== target.role) {
        return fail("نمی‌توانید نقش حساب خودتان را تغییر دهید.");
      }
      if (!canCreateRole(actor, role)) {
        return fail("شما مجاز به تخصیص این نقش نیستید.", 403);
      }
      data.role = role;
    }

    if (body.password !== undefined && String(body.password).length > 0) {
      const strength = validatePasswordStrength(body.password);
      if (!strength.valid) return fail(strength.message);
      data.password = await hashPassword(body.password);
    }

    if (Object.keys(data).length === 0) {
      return fail("هیچ تغییری برای ذخیره ارسال نشده است.");
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: PUBLIC_USER_SELECT,
    });

    // اگر رمز یا نقش عوض شد، سشن‌های فعال آن کاربر باطل می‌شوند
    if (data.password || data.role) {
      await prisma.session.deleteMany({ where: { userId: id } }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: `اطلاعات «${updated.fullName}» به‌روزرسانی شد.`,
      user: updated,
    });
  } catch (err) {
    console.error("PATCH /api/users Error:", err);
    if (err?.code === "P2002") {
      return fail("این نام کاربری قبلاً ثبت شده است.", 409);
    }
    return fail("خطا در ویرایش کاربر.", 500);
  }
}

/* --------------------------------------------------------------- DELETE */

export async function DELETE(req) {
  try {
    const { user: actor, error } = await requireAuth({
      permission: "MANAGE_USERS",
    });
    if (error) return error;

    if (!can.isSuperAdmin(actor)) {
      return fail("فقط سوپرادمین اجازه حذف کاربر را دارد.", 403);
    }

    const { searchParams } = new URL(req.url);
    const id = Number.parseInt(searchParams.get("id"), 10);

    if (!Number.isInteger(id) || id <= 0) {
      return fail("شناسه کاربر نامعتبر است.");
    }
    if (actor.id === id) {
      return fail("نمی‌توانید حساب کاربری خودتان را حذف کنید.");
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, fullName: true },
    });
    if (!target) return fail("کاربر مورد نظر یافت نشد.", 404);

    if (target.username === "admin") {
      return fail("حساب مدیر اصلی سیستم قابل حذف نیست.", 403);
    }

    // Session / UserAppAccess / UserPermission با onDelete: Cascade پاک می‌شوند
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `کاربر «${target.fullName}» حذف شد.`,
    });
  } catch (err) {
    console.error("DELETE /api/users Error:", err);
    return fail("خطا در حذف کاربر.", 500);
  }
}
