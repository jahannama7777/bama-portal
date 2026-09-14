import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

// دریافت لیست سامانه‌ها
export async function GET() {
  try {
    const apps = await prisma.application.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(apps, { status: 200 });
  } catch (error) {
    console.error("GET /api/apps Error:", error);
    return NextResponse.json({ error: "خطا در دریافت سامانه‌ها" }, { status: 500 });
  }
}

// ایجاد یا ویرایش سامانه
export async function POST(req) {
  try {
    const body = await req.json();
    const { id, titleFa, titleEn, desc, icon, url, href, roles, order } = body;

    const displayTitle = titleFa || "سامانه جدید";
    const appUrl = url || href || "#";

    if (id) {
      // ویرایش
      const updated = await prisma.application.update({
        where: { id: Number(id) },
        data: {
          titleFa: displayTitle,
          titleEn: titleEn || null,
          desc: desc || null,
          icon: icon || "Globe",
          url: appUrl,
          ...(order !== undefined ? { order: Number(order) } : {}),
        },
      });
      return NextResponse.json(updated, { status: 200 });
    } else {
      // ایجاد
      const created = await prisma.application.create({
        data: {
          titleFa: displayTitle,
          titleEn: titleEn || null,
          desc: desc || null,
          icon: icon || "Globe",
          url: appUrl,
        },
      });
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    console.error("POST /api/apps Error:", error);
    return NextResponse.json({ error: "خطا در ذخیره سامانه" }, { status: 500 });
  }
}

// حذف سامانه
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "شناسه ارسال نشده است" }, { status: 400 });
    }
    await prisma.application.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/apps Error:", error);
    return NextResponse.json({ error: "خطا در حذف سامانه" }, { status: 500 });
  }
}
