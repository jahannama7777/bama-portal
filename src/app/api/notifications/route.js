import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

// دریافت لیست اعلان‌ها
export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error("GET /api/notifications Error:", error);
    return NextResponse.json({ error: "خطا در دریافت اعلان‌ها" }, { status: 500 });
  }
}

// ایجاد یا ویرایش اعلان
export async function POST(req) {
  try {
    const body = await req.json();
    const { id, title, desc, date, type, badge, badgeColor } = body;

    const notifData = {
      title: title || "اعلان جدید",
      desc: desc || "",
      date: date || new Date().toLocaleDateString("fa-IR"),
      type: type || "info",
      badge: badge || "اطلاعیه",
      badgeColor: badgeColor || "blue",
    };

    if (id && !String(id).startsWith("notif-")) {
      const updated = await prisma.notification.update({
        where: { id: Number(id) },
        data: notifData,
      });
      return NextResponse.json(updated, { status: 200 });
    } else {
      const created = await prisma.notification.create({
        data: notifData,
      });
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    console.error("POST /api/notifications Error:", error);
    return NextResponse.json({ error: "خطا در ذخیره اعلان" }, { status: 500 });
  }
}

// حذف اعلان
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "شناسه ارسال نشده است" }, { status: 400 });
    }
    await prisma.notification.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/notifications Error:", error);
    return NextResponse.json({ error: "خطا در حذف اعلان" }, { status: 500 });
  }
}
