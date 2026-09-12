"use server";

import prisma from "@/src/lib/prisma";
import crypto from "crypto";
import { cookies } from "next/headers";

// تابع هش کردن پسورد با الگوریتم امن SHA-256 و Salt
function hashPassword(password) {
  return crypto.createHash("sha256").update(password + "BAMA_SECRET_KEY").digest("hex");
}

// بررسی ساخت کاربر اولیه در صورت خالی بودن دیتابیس
async function ensureSuperAdmin() {
  const count = await prisma.user.count();
  if (count === 0) {
    await prisma.user.create({
      data: {
        username: "admin",
        fullName: "مدیر ارشد سامانه",
        password: hashPassword("admin123"),
        role: "SUPERADMIN",
      },
    });
  }
}

// ورود کاربر
export async function loginAction(formData) {
  await ensureSuperAdmin();
  
  const username = formData.get("username")?.trim();
  const password = formData.get("password")?.trim();

  if (!username || !password) {
    return { success: false, message: "نام کاربری و کلمه عبور الزامی است." };
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || user.password !== hashPassword(password)) {
    return { success: false, message: "نام کاربری یا رمز عبور اشتباه است." };
  }

  // ثبت سشن ساده در کوکی با قابلیت دسترسی امن
  const cookieStore = await cookies();
  const sessionData = JSON.stringify({
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
  });

  cookieStore.set("bama_auth_session", sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // ۷ روز
  });

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    },
  };
}

// دریافت سشن فعلی
export async function getSessionAction() {
  const cookieStore = await cookies();
  const session = cookieStore.get("bama_auth_session");
  if (!session) return null;

  try {
    return JSON.parse(session.value);
  } catch {
    return null;
  }
}

// خروج
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("bama_auth_session");
  return { success: true };
}

// ایجاد کاربر جدید با نقش مشخص (توسط مدیر)
export async function createUserAction(formData) {
  const session = await getSessionAction();
  if (!session || (session.role !== "SUPERADMIN" && session.role !== "ADMIN")) {
    return { success: false, message: "عدم دسترسی کافی برای ایجاد کاربر." };
  }

  const username = formData.get("username")?.trim();
  const fullName = formData.get("fullName")?.trim();
  const password = formData.get("password")?.trim();
  const role = formData.get("role") || "USER";

  if (!username || !password) {
    return { success: false, message: "فیلدهای اجباری را تکمیل کنید." };
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return { success: false, message: "این نام کاربری قبلاً ثبت شده است." };
  }

  const newUser = await prisma.user.create({
    data: {
      username,
      fullName,
      password: hashPassword(password),
      role,
    },
  });

  return {
    success: true,
    user: { id: newUser.id, username: newUser.username, role: newUser.role, fullName: newUser.fullName },
  };
}

// لیست تمام کاربران
export async function getUsersAction() {
  const session = await getSessionAction();
  if (!session || (session.role !== "SUPERADMIN" && session.role !== "ADMIN")) {
    return [];
  }

  return await prisma.user.findMany({
    select: { id: true, username: true, fullName: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}
