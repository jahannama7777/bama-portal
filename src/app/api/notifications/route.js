import { NextResponse } from "next/server";
import { requireAuth, can } from "@/src/lib/apiGuards";
import { notificationService } from "@/services/notificationService";

/**
 * GET — list notifications visible to the current user.
 * GUEST / anonymous: empty list (overview only).
 */
export async function GET() {
  try {
    const { user, error } = await requireAuth({ allowGuest: true });

    // Unauthenticated or GUEST: no real notifications
    if (error || !user || can.isGuest(user)) {
      return NextResponse.json([], { status: 200 });
    }

    const seeAll = can.editAnyAnnouncement(user);
    const list = await notificationService.listForUser({
      id: user.id,
      role: user.role,
      department: user.department,
      seeAll,
    });

    return NextResponse.json(list, { status: 200 });
  } catch (err) {
    console.error("GET /api/notifications Error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت اعلان‌ها" },
      { status: 500 },
    );
  }
}

/**
 * POST — create or update a notification (targeted).
 * Body may include: targetType, targetUserId, targetRole, targetDepartment
 */
export async function POST(req) {
  try {
    const { user, error } = await requireAuth({
      permission: "EDIT_OWN_ANNOUNCEMENT",
    });
    if (error) return error;

    const body = await req.json();
    const {
      id,
      title,
      desc,
      date,
      type,
      badge,
      badgeColor,
      department,
      targetType,
      targetUserId,
      targetRole,
      targetDepartment,
    } = body;

    // ——— Update ———
    if (id && !String(id).startsWith("notif-")) {
      const existing = await notificationService.getById(Number(id));
      if (!existing) {
        return NextResponse.json({ error: "اعلان یافت نشد" }, { status: 404 });
      }

      const isOwner = existing.createdById === user.id;
      if (!can.editAnyAnnouncement(user) && !isOwner) {
        return NextResponse.json(
          { error: "فقط اعلان‌های خودتان را می‌توانید ویرایش کنید." },
          { status: 403 },
        );
      }

      // Broad retargeting requires SEND_NOTIFICATIONS
      const wantsBroadTarget =
        targetType === "ALL" ||
        targetType === "ROLE" ||
        (targetType === "DEPARTMENT" &&
          targetDepartment &&
          targetDepartment !== user.department);

      if (wantsBroadTarget && !can.sendNotifications(user)) {
        return NextResponse.json(
          { error: "مجوز ارسال اعلان گروهی را ندارید." },
          { status: 403 },
        );
      }

      const updated = await notificationService.update(Number(id), {
        title: title || "اعلان جدید",
        desc: desc || "",
        date: date || existing.date,
        type: type || "info",
        badge: badge || "اطلاعیه",
        badgeColor: badgeColor || "blue",
        department: department ?? existing.department,
        targetType,
        targetUserId: targetUserId != null ? Number(targetUserId) : undefined,
        targetRole,
        targetDepartment,
      });

      return NextResponse.json(updated, { status: 200 });
    }

    // ——— Create ———
    let resolvedType = targetType || "ALL";
    let resolvedDept = targetDepartment || department || user.department || null;
    let resolvedRole = targetRole || null;
    let resolvedUserId =
      targetUserId != null ? Number(targetUserId) : null;

    // Supervisors without SEND_NOTIFICATIONS: department-scoped only
    if (!can.sendNotifications(user) && !can.editAnyAnnouncement(user)) {
      resolvedType = "DEPARTMENT";
      resolvedDept = user.department || "عمومی";
      resolvedRole = null;
      resolvedUserId = null;
    }

    if (resolvedType === "INDIVIDUAL" && !resolvedUserId) {
      return NextResponse.json(
        { error: "شناسه کاربر مخاطب الزامی است." },
        { status: 400 },
      );
    }

    const created = await notificationService.createAndDeliver({
      title: title || "اعلان جدید",
      desc: desc || "",
      date: date || new Date().toISOString(),
      type: type || "info",
      badge: badge || "اطلاعیه",
      badgeColor: badgeColor || "blue",
      department: department ?? user.department ?? null,
      targetType: resolvedType,
      targetUserId: resolvedUserId,
      targetRole: resolvedRole,
      targetDepartment: resolvedDept,
      createdById: user.id,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/notifications Error:", err);
    return NextResponse.json(
      { error: err?.message || "خطا در ذخیره اعلان" },
      { status: 500 },
    );
  }
}

/**
 * DELETE — remove a notification
 */
export async function DELETE(req) {
  try {
    const { user, error } = await requireAuth({
      permission: "EDIT_OWN_ANNOUNCEMENT",
    });
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "شناسه ارسال نشده است" },
        { status: 400 },
      );
    }

    const existing = await notificationService.getById(Number(id));
    if (!existing) {
      return NextResponse.json({ error: "اعلان یافت نشد" }, { status: 404 });
    }

    const isOwner = existing.createdById === user.id;
    if (!can.editAnyAnnouncement(user) && !isOwner) {
      return NextResponse.json(
        { error: "فقط اعلان‌های خودتان را می‌توانید حذف کنید." },
        { status: 403 },
      );
    }

    await notificationService.delete(Number(id));
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/notifications Error:", err);
    return NextResponse.json(
      { error: "خطا در حذف اعلان" },
      { status: 500 },
    );
  }
}
