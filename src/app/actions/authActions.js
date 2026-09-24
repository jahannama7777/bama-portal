"use server";

/**
 * File: src/app/actions/authActions.js
 *
 * تغییرات نسبت به نسخه قبلی:
 *  1. هش رمز عبور از SHA-256 به bcrypt منتقل شد (با پذیرش رمزهای قدیمی و
 *     ارتقای خودکار آن‌ها هنگام اولین ورود موفق).
 *  2. اکشن updateUserAction اضافه شد تا فرم «ویرایش کاربر» کار کند.
 *  3. تخصیص نقش با canCreateRole و رتبه‌بندی نقش‌ها محافظت شد.
 *  4. هنگام خروج، رکورد Session در دیتابیس هم حذف می‌شود.
 *  5. ensureSuperAdmin فقط در محیط development اجرا می‌شود تا در production
 *     به‌صورت ناخواسته حساب پیش‌فرض با رمز شناخته‌شده ساخته نشود.
 */

import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/src/lib/prisma";
import { can, canCreateRole } from "@/lib/rbac";
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from "@/src/lib/password";

const SESSION_COOKIE = "bama_session_token";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // ۷ روز

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

function canManageTarget(actor, target) {
  if (actor.role === "SUPERADMIN") return true;
  return rank(actor.role) > rank(target.role);
}

/** ساخت سوپرادمین اولیه — فقط در توسعه و فقط وقتی دیتابیس خالی است */
async function ensureSuperAdmin() {
  if (process.env.NODE_ENV === "production") return;

  const count = await prisma.user.count();
  if (count > 0) return;

  await prisma.user.create({
    data: {
      username: "admin",
      fullName: "مدیر ارشد سیستم",
      department: "فناوری اطلاعات و ارتباطات",
      password: await hashPassword("J13641364"),
      role: "SUPERADMIN",
    },
  });
}

async function getUserBySessionToken(token) {
  if (!token) return null;

  const dbSession = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!dbSession?.user) return null;

  if (new Date() > dbSession.expiresAt) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
    return null;
  }

  return dbSession.user;
}

/* ---------------------------------------------------------------- LOGIN */

export async function loginAction(formData) {
  try {
    await ensureSuperAdmin();

    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!username || !password) {
      return { success: false, message: "نام کاربری و کلمه عبور الزامی است." };
    }

    const user = await prisma.user.findUnique({ where: { username } });

    const invalid = {
      success: false,
      message: "نام کاربری یا رمز عبور اشتباه است.",
    };

    if (!user) return invalid;

    const { ok, needsRehash } = await verifyPassword(password, user.password);
    if (!ok) return invalid;

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

    await prisma.session
      .deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } })
      .catch(() => {});

    await prisma.session.create({
      data: { token: sessionToken, userId: user.id, expiresAt },
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        department: user.department,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("loginAction Error:", error);
    return { success: false, message: "خطای سرور در فرایند ورود." };
  }
}

/* -------------------------------------------------------------- SESSION */

export async function getSessionAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const user = await getUserBySessionToken(token);
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      department: user.department,
      role: user.role,
    };
  } catch (error) {
    console.error("getSessionAction Error:", error);
    return null;
  }
}

/* --------------------------------------------------------------- LOGOUT */

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (token) {
      await prisma.session.deleteMany({ where: { token } }).catch(() => {});
    }

    cookieStore.delete(SESSION_COOKIE);
    cookieStore.delete("bama_auth_session");

    return { success: true };
  } catch (error) {
    console.error("logoutAction Error:", error);
    return { success: false, message: "خطا در خروج از سیستم." };
  }
}

/* ---------------------------------------------------------- CREATE USER */

export async function createUserAction(formData) {
  try {
    const session = await getSessionAction();

    if (!can.manageUsers(session)) {
      return { success: false, message: "عدم دسترسی کافی برای ایجاد کاربر." };
    }

    const username = String(formData.get("username") || "").trim();
    const fullName = String(formData.get("fullName") || "").trim();
    const department = String(formData.get("department") || "").trim() || "عمومی";
    const password = String(formData.get("password") || "");
    const role = String(formData.get("role") || "USER").toUpperCase();

    if (!username || !fullName || !password) {
      return { success: false, message: "فیلدهای اجباری را تکمیل کنید." };
    }

    if (!/^[A-Za-z0-9._-]{3,32}$/.test(username)) {
      return {
        success: false,
        message:
          "نام کاربری باید ۳ تا ۳۲ کاراکتر و فقط شامل حروف انگلیسی، عدد، نقطه، خط تیره یا آندرلاین باشد.",
      };
    }

    if (!VALID_ROLES.includes(role)) {
      return { success: false, message: "نقش انتخاب‌شده معتبر نیست." };
    }

    const strength = validatePasswordStrength(password);
    if (!strength.valid) return { success: false, message: strength.message };

    if (!canCreateRole(session, role)) {
      return { success: false, message: "شما مجاز به ایجاد این نقش نیستید." };
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return { success: false, message: "این نام کاربری قبلاً ثبت شده است." };
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        fullName,
        department,
        password: await hashPassword(password),
        role,
      },
      select: PUBLIC_USER_SELECT,
    });

    return {
      success: true,
      message: `حساب کاربری «${newUser.fullName}» ایجاد شد.`,
      user: newUser,
    };
  } catch (error) {
    console.error("createUserAction Error:", error);
    if (error?.code === "P2002") {
      return { success: false, message: "این نام کاربری قبلاً ثبت شده است." };
    }
    return { success: false, message: "خطا در ایجاد کاربر." };
  }
}

/* ---------------------------------------------------------- UPDATE USER */

/**
 * ویرایش کاربر موجود.
 * @param {number|string} userId
 * @param {{ fullName?: string, username?: string, department?: string, role?: string, password?: string }} payload
 */
export async function updateUserAction(userId, payload = {}) {
  try {
    const session = await getSessionAction();

    if (!can.manageUsers(session)) {
      return { success: false, message: "عدم دسترسی کافی برای ویرایش کاربر." };
    }

    const id = Number.parseInt(userId, 10);
    if (!Number.isInteger(id) || id <= 0) {
      return { success: false, message: "شناسه کاربر نامعتبر است." };
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, role: true, fullName: true },
    });
    if (!target) return { success: false, message: "کاربر مورد نظر یافت نشد." };

    if (session.id !== target.id && !canManageTarget(session, target)) {
      return { success: false, message: "شما مجاز به ویرایش این حساب نیستید." };
    }

    const data = {};

    if (payload.fullName !== undefined) {
      const fullName = String(payload.fullName).trim();
      if (!fullName) {
        return { success: false, message: "نام و نام خانوادگی نمی‌تواند خالی باشد." };
      }
      data.fullName = fullName;
    }

    if (payload.department !== undefined) {
      data.department = String(payload.department).trim() || "عمومی";
    }

    if (payload.username !== undefined) {
      const username = String(payload.username).trim();
      if (!/^[A-Za-z0-9._-]{3,32}$/.test(username)) {
        return { success: false, message: "قالب نام کاربری معتبر نیست." };
      }
      if (username !== target.username) {
        const clash = await prisma.user.findUnique({ where: { username } });
        if (clash) {
          return { success: false, message: "این نام کاربری قبلاً ثبت شده است." };
        }
        data.username = username;
      }
    }

    if (payload.role !== undefined) {
      const role = String(payload.role).toUpperCase();
      if (!VALID_ROLES.includes(role)) {
        return { success: false, message: "نقش انتخاب‌شده معتبر نیست." };
      }
      if (session.id === target.id && role !== target.role) {
        return { success: false, message: "نمی‌توانید نقش حساب خودتان را تغییر دهید." };
      }
      if (!canCreateRole(session, role)) {
        return { success: false, message: "شما مجاز به تخصیص این نقش نیستید." };
      }
      data.role = role;
    }

    if (payload.password !== undefined && String(payload.password).length > 0) {
      const strength = validatePasswordStrength(payload.password);
      if (!strength.valid) return { success: false, message: strength.message };
      data.password = await hashPassword(payload.password);
    }

    if (Object.keys(data).length === 0) {
      return { success: false, message: "هیچ تغییری برای ذخیره ارسال نشده است." };
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: PUBLIC_USER_SELECT,
    });

    // تغییر رمز یا نقش ⇒ ابطال سشن‌های فعال آن کاربر
    if (data.password || data.role) {
      await prisma.session.deleteMany({ where: { userId: id } }).catch(() => {});
    }

    return {
      success: true,
      message: `اطلاعات «${updated.fullName}» به‌روزرسانی شد.`,
      user: updated,
    };
  } catch (error) {
    console.error("updateUserAction Error:", error);
    if (error?.code === "P2002") {
      return { success: false, message: "این نام کاربری قبلاً ثبت شده است." };
    }
    return { success: false, message: "خطا در ویرایش کاربر." };
  }
}

/* ---------------------------------------------------------- DELETE USER */

export async function deleteUserAction(userId) {
  try {
    const session = await getSessionAction();

    if (!can.isSuperAdmin(session)) {
      return { success: false, message: "فقط سوپرادمین اجازه حذف کاربر را دارد." };
    }

    const id = Number.parseInt(userId, 10);
    if (!Number.isInteger(id) || id <= 0) {
      return { success: false, message: "شناسه کاربر نامعتبر است." };
    }

    if (session.id === id) {
      return { success: false, message: "نمی‌توانید حساب کاربری خودتان را حذف کنید." };
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, fullName: true },
    });
    if (!target) return { success: false, message: "کاربر مورد نظر یافت نشد." };

    if (target.username === "admin") {
      return { success: false, message: "حساب مدیر اصلی سیستم قابل حذف نیست." };
    }

    await prisma.user.delete({ where: { id } });

    return { success: true, message: `کاربر «${target.fullName}» حذف شد.` };
  } catch (error) {
    console.error("deleteUserAction Error:", error);
    return { success: false, message: "خطا در حذف کاربر." };
  }
}

/* ------------------------------------------------------------ LIST USERS */

export async function getUsersAction() {
  try {
    const session = await getSessionAction();
    if (!can.manageUsers(session)) return [];

    return await prisma.user.findMany({
      select: PUBLIC_USER_SELECT,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("getUsersAction Error:", error);
    return [];
  }
}
