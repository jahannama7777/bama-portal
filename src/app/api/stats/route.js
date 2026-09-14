import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

// دریافت لیست آمارها
export async function GET() {
  try {
    const stats = await prisma.stat.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("GET /api/stats Error:", error);
    return NextResponse.json({ error: "خطا در دریافت آمارها" }, { status: 500 });
  }
}

// ایجاد یا ویرایش آمار
export async function POST(req) {
  try {
    const body = await req.json();
    const { id, titleFa, title, label, value, icon, order } = body;

    // همه نام‌های محتمل به یک فیلد title تبدیل می‌شوند (چون در دیتابیس فقط title داریم)
    const displayTitle = title || titleFa || label || "آمار جدید";

    if (id) {
      const updated = await prisma.stat.update({
        where: { id: Number(id) },
        data: {
          title: displayTitle,
          value: String(value ?? "۰"),
          icon: icon || "Activity",
          ...(order !== undefined ? { order: Number(order) } : {}),
        },
      });
      return NextResponse.json(updated, { status: 200 });
    } else {
      const created = await prisma.stat.create({
        data: {
          title: displayTitle,
          value: String(value ?? "۰"),
          icon: icon || "Activity",
        },
      });
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    console.error("POST /api/stats Error:", error);
    return NextResponse.json({ error: "خطا در ذخیره آمار" }, { status: 500 });
  }
}

// حذف آمار
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "شناسه ارسال نشده است" }, { status: 400 });
    }
    await prisma.stat.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/stats Error:", error);
    return NextResponse.json({ error: "خطا در حذف آمار" }, { status: 500 });
  }
}
