"use server";

import prisma from "@/src/lib/prisma";
import crypto from "crypto";
import { cookies } from "next/headers";

// هش کردن پسورد
function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "BAMA_SECRET_KEY")
    .digest("hex");
}

// فقط اگر هیچ کاربری در سیستم نبود، یک سوپرادمین اولیه بساز
async function ensureSuperAdmin() {
  const count = await prisma.user.count();

  if (count === 0) {
    await prisma.user.create({
      data: {
        username: "admin",
        fullName: "مدیر ارشد سیستم",
        department: "فناوری اطلاعات و ارتباطات",
        password: hashPassword("J13641364"),
        role: "SUPERADMIN",
      },
    });
  }
}

// گرفتن کاربر از روی توکن سشن
async function getUserBySessionToken(token) {
  if (!token) return null;

  const dbSession = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!dbSession) return null;

  // اگر سشن منقضی شده باشد
  if (new Date() > dbSession.expiresAt) {
    await prisma.session.delete({
      where: { token },
    }).catch(() => {});
    return null;
  }

  return dbSession.user;
}

// ورود کاربر
export async function loginAction(formData) {
  await ensureSuperAdmin();

  const username = formData.get("username")?.trim();
  const password = formData.get("password")?.trim();

  if (!username || !password) {
    return {
      success: false,
      message: "نام کاربری و کلمه عبور الزامی است.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || user.password !== hashPassword(password)) {
    return {
      success: false,
      message: "نام کاربری یا رمز عبور اشتباه است.",
    };
  }

  // ایجاد توکن تصادفی سشن
  const sessionToken = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 روز

  // حذف سشن‌های منقضی قبلی همین کاربر (اختیاری ولی خوب)
  await prisma.session.deleteMany({
    where: {
      userId: user.id,
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  // ذخیره سشن در دیتابیس
  await prisma.session.create({
    data: {
      token: sessionToken,
      userId: user.id,
      expiresAt,
    },
  });

  // ذخیره فقط توکن در کوکی
  const cookieStore = await cookies();
  cookieStore.set("bama_session_token", sessionToken, {
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
}

// دریافت سشن فعلی
export async function getSessionAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("bama_session_token")?.value;

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
    console.error("خطا در getSessionAction:", error);
    return null;
  }
}

// خروج
export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("bama_session_token")?.value;

    if (token) {
      await prisma.session.deleteMany({
        where: { token },
      }).catch(() => {});
    }

    cookieStore.delete("bama_session_token");

    return { success: true };
  } catch (error) {
    console.error("خطا در logoutAction:", error);
    return { success: false, message: "خطا در خروج از سیستم." };
  }
}

// ایجاد کاربر جدید
export async function createUserAction(formData) {
  const session = await getSessionAction();

  if (!session || (session.role !== "SUPERADMIN" && session.role !== "ADMIN")) {
    return {
      success: false,
      message: "عدم دسترسی کافی برای ایجاد کاربر.",
    };
  }

  const username = formData.get("username")?.trim();
  const fullName = formData.get("fullName")?.trim();
  const department = formData.get("department")?.trim() || "عمومی";
  const password = formData.get("password")?.trim();
  const role = formData.get("role") || "USER";

  if (!username || !fullName || !password) {
    return {
      success: false,
      message: "فیلدهای اجباری را تکمیل کنید.",
    };
  }

  const existing = await prisma.user.findUnique({
    where: { username },
  });

  if (existing) {
    return {
      success: false,
      message: "این نام کاربری قبلاً ثبت شده است.",
    };
  }

  const newUser = await prisma.user.create({
    data: {
      username,
      fullName,
      department,
      password: hashPassword(password),
      role,
    },
  });

  return {
    success: true,
    user: {
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.fullName,
      department: newUser.department,
      role: newUser.role,
    },
  };
}

// حذف کاربر
export async function deleteUserAction(userId) {
  const session = await getSessionAction();

  if (!session || session.role !== "SUPERADMIN") {
    return {
      success: false,
      message: "فقط سوپرادمین اجازه حذف کاربر را دارد.",
    };
  }

  const id = Number(userId);
  if (!id) {
    return {
      success: false,
      message: "شناسه کاربر نامعتبر است.",
    };
  }

  // جلوگیری از حذف خود سوپرادمین لاگین کرده
  if (session.id === id) {
    return {
      success: false,
      message: "شما نمی‌توانید حساب کاربری خودتان را حذف کنید.",
    };
  }

  await prisma.user.delete({
    where: { id },
  });

  return { success: true };
}

// لیست کاربران
export async function getUsersAction() {
  const session = await getSessionAction();

  if (!session || (session.role !== "SUPERADMIN" && session.role !== "ADMIN")) {
    return [];
  }

  return await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      fullName: true,
      department: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
