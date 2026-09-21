import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireAuth, can, canAccessApp } from "@/src/lib/apiGuards";

export async function GET() {
  try {
    const { user } = await requireAuth({ allowGuest: true });

    const apps = await prisma.application.findMany({
      orderBy: { order: "asc" },
    });

    // GUEST / anonymous → no apps (overview only)
    if (!user || can.isGuest(user)) {
      return NextResponse.json([], { status: 200 });
    }

    // Optional per-user overrides (available after schema migration)
    let accessMap = new Map();
    try {
      if (prisma.userAppAccess) {
        const overrides = await prisma.userAppAccess.findMany({
          where: { userId: user.id },
          select: { appId: true, allowed: true },
        });
        accessMap = new Map(overrides.map((o) => [o.appId, o.allowed]));
      }
    } catch {
      // Model not migrated yet — role-based filtering only
    }

    const visible = apps.filter((app) =>
      canAccessApp(user, {
        id: app.id,
        roles: app.roles,
        userAllowed: accessMap.has(app.id) ? accessMap.get(app.id) : null,
      }),
    );

    return NextResponse.json(visible, { status: 200 });
  } catch (error) {
    console.error("GET /api/apps Error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت سامانه‌ها" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const { error } = await requireAuth({ permission: "MANAGE_APPS" });
    if (error) return error;

    const body = await req.json();
    const { id, titleFa, titleEn, desc, icon, url, href, roles, order } = body;

    const displayTitle = titleFa || "سامانه جدید";
    const appUrl = url || href || "#";

    if (id) {
      const updated = await prisma.application.update({
        where: { id: Number(id) },
        data: {
          titleFa: displayTitle,
          titleEn: titleEn || null,
          desc: desc || null,
          icon: icon || "Globe",
          url: appUrl,
          ...(roles !== undefined
            ? {
                roles:
                  typeof roles === "string" ? roles : JSON.stringify(roles),
              }
            : {}),
          ...(order !== undefined ? { order: Number(order) } : {}),
        },
      });
      return NextResponse.json(updated, { status: 200 });
    }

    const created = await prisma.application.create({
      data: {
        titleFa: displayTitle,
        titleEn: titleEn || null,
        desc: desc || null,
        icon: icon || "Globe",
        url: appUrl,
        ...(roles !== undefined
          ? {
              roles: typeof roles === "string" ? roles : JSON.stringify(roles),
            }
          : {}),
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/apps Error:", error);
    return NextResponse.json(
      { error: "خطا در ذخیره سامانه" },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    const { error } = await requireAuth({ permission: "MANAGE_APPS" });
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "شناسه ارسال نشده است" },
        { status: 400 },
      );
    }
    await prisma.application.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/apps Error:", error);
    return NextResponse.json(
      { error: "خطا در حذف سامانه" },
      { status: 500 },
    );
  }
}
