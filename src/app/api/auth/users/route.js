import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import crypto from "crypto";
import { requireAuth, can, canCreateRole } from "@/src/lib/apiGuards";

function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "BAMA_SECRET_KEY")
    .digest("hex");
}

export async function GET() {
  const { error } = await requireAuth({ permission: "MANAGE_USERS" });
  if (error) return error;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      fullName: true,
      department: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(req) {
  const { user, error } = await requireAuth({ permission: "MANAGE_USERS" });
  if (error) return error;

  const { username, fullName, password, role, department } = await req.json();

  if (!username?.trim() || !password?.trim()) {
    return NextResponse.json(
      { success: false, message: "اطلاعات کامل نیست." },
      { status: 400 },
    );
  }

  const targetRole = role || "USER";
  if (!canCreateRole(user, targetRole)) {
    return NextResponse.json(
      { success: false, message: "مجاز به ایجاد این نقش نیستید." },
      { status: 403 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { username: username.trim() },
  });
  if (existing) {
    return NextResponse.json(
      { success: false, message: "نام کاربری تکراری است." },
      { status: 409 },
    );
  }

  const newUser = await prisma.user.create({
    data: {
      username: username.trim(),
      fullName: fullName?.trim() || "",
      department: department?.trim() || "عمومی",
      password: hashPassword(password.trim()),
      role: targetRole,
    },
  });

  return NextResponse.json({
    success: true,
    user: {
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.fullName,
      role: newUser.role,
    },
  });
}

export async function DELETE(req) {
  const { user, error } = await requireAuth({ permission: "MANAGE_USERS" });
  if (error) return error;

  // Only SUPERADMIN may delete users (matches authActions)
  if (!can.isSuperAdmin(user)) {
    return NextResponse.json(
      { success: false, message: "فقط سوپرادمین اجازه حذف کاربر را دارد." },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id"), 10);

  if (!id) {
    return NextResponse.json(
      { success: false, message: "شناسه نادرست است." },
      { status: 400 },
    );
  }

  if (user.id === id) {
    return NextResponse.json(
      { success: false, message: "نمی‌توانید حساب خودتان را حذف کنید." },
      { status: 400 },
    );
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
