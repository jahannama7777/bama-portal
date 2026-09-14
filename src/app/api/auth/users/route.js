import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import crypto from "crypto";

function hashPassword(password) {
  return crypto.createHash("sha256").update(password + "BAMA_SECRET_KEY").digest("hex");
}

function getSession(req) {
  try {
    const raw = req.cookies.get("bama_auth_session")?.value;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// دریافت لیست کاربران
export async function GET(req) {
  const session = getSession(req);
  if (!session || (session.role !== "SUPERADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json([], { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: { id: true, username: true, fullName: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

// ایجاد کاربر جدید
export async function POST(req) {
  const session = getSession(req);
  if (!session || (session.role !== "SUPERADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, message: "عدم دسترسی کافی." }, { status: 403 });
  }

  const { username, fullName, password, role } = await req.json();

  if (!username?.trim() || !password?.trim()) {
    return NextResponse.json({ success: false, message: "اطلاعات کامل نیست." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username: username.trim() } });
  if (existing) {
    return NextResponse.json({ success: false, message: "نام کاربری تکراری است." }, { status: 409 });
  }

  const newUser = await prisma.user.create({
    data: {
      username: username.trim(),
      fullName: fullName?.trim() || "",
      password: hashPassword(password.trim()),
      role: role || "USER",
    },
  });

  return NextResponse.json({
    success: true,
    user: { id: newUser.id, username: newUser.username, fullName: newUser.fullName, role: newUser.role },
  });
}

// حذف کاربر
export async function DELETE(req) {
  const session = getSession(req);
  if (!session || (session.role !== "SUPERADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, message: "عدم دسترسی." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id"));

  if (!id) return NextResponse.json({ success: false, message: "شناسه نادرست است." }, { status: 400 });

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
