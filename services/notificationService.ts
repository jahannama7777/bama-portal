/**
 * NotificationService — targeted delivery foundation (web + future mobile).
 *
 * Target modes:
 *   INDIVIDUAL  → one userId
 *   ROLE        → all users with that Role (excludes GUEST by default)
 *   DEPARTMENT  → all users in a department
 *   ALL         → all authenticated non-GUEST users
 *
 * Flow: create Notification → resolve recipients → receipts + log →
 *       (stub) enqueue device push via DeviceToken
 *
 * NOTE: Requires schema Step 1 applied (migrate + prisma generate) before runtime use.
 */

import { prisma } from "../lib/prisma";
import type { Role } from "../lib/rbac";

export type NotificationTargetType =
  | "INDIVIDUAL"
  | "ROLE"
  | "DEPARTMENT"
  | "ALL";

export type CreateNotificationInput = {
  title: string;
  desc: string;
  date?: string;
  type?: string;
  badge?: string;
  badgeColor?: string;
  department?: string | null;
  targetType?: NotificationTargetType;
  targetUserId?: number | null;
  targetRole?: Role | null;
  targetDepartment?: string | null;
  createdById?: number | null;
  /** When false, only persists the Notification row (no receipts/logs). Default true. */
  deliver?: boolean;
};

export type ListContext = {
  id: number;
  role: Role | string;
  department?: string | null;
  /** When true (ADMIN+), return every notification */
  seeAll?: boolean;
};

function buildTargetKey(
  targetType: NotificationTargetType,
  opts: {
    targetUserId?: number | null;
    targetRole?: Role | null;
    targetDepartment?: string | null;
  },
): string {
  switch (targetType) {
    case "INDIVIDUAL":
      return `user:${opts.targetUserId ?? 0}`;
    case "ROLE":
      return `role:${opts.targetRole ?? "USER"}`;
    case "DEPARTMENT":
      return `department:${opts.targetDepartment ?? ""}`;
    case "ALL":
    default:
      return "all";
  }
}

const createdByInclude = {
  createdBy: {
    select: {
      id: true,
      username: true,
      fullName: true,
      role: true,
      department: true,
    },
  },
} as const;

export class NotificationService {
  /**
   * Create a portal notification and optionally fan-out delivery metadata.
   */
  async createAndDeliver(input: CreateNotificationInput) {
    const targetType: NotificationTargetType = input.targetType || "ALL";

    if (targetType === "INDIVIDUAL" && !input.targetUserId) {
      throw new Error("targetUserId is required for INDIVIDUAL targeting");
    }
    if (targetType === "ROLE" && !input.targetRole) {
      throw new Error("targetRole is required for ROLE targeting");
    }
    if (targetType === "DEPARTMENT" && !input.targetDepartment) {
      throw new Error("targetDepartment is required for DEPARTMENT targeting");
    }

    const notification = await prisma.notification.create({
      data: {
        title: input.title,
        desc: input.desc,
        date: input.date || new Date().toISOString(),
        type: input.type || "info",
        badge: input.badge || "اطلاعیه",
        badgeColor: input.badgeColor || "blue",
        department:
          input.department ??
          (targetType === "DEPARTMENT" ? input.targetDepartment : null),
        targetType,
        targetUserId: targetType === "INDIVIDUAL" ? input.targetUserId! : null,
        targetRole: targetType === "ROLE" ? input.targetRole! : null,
        targetDepartment:
          targetType === "DEPARTMENT" ? input.targetDepartment! : null,
        createdById: input.createdById ?? null,
      },
      include: createdByInclude,
    });

    if (input.deliver === false) {
      return notification;
    }

    await this.fanOut(notification.id, {
      title: notification.title,
      body: notification.desc,
      targetType,
      targetUserId: notification.targetUserId,
      targetRole: notification.targetRole as Role | null,
      targetDepartment: notification.targetDepartment,
    });

    return notification;
  }

  async sendToUser(userId: number, title: string, body: string, createdById?: number) {
    return this.createAndDeliver({
      title,
      desc: body,
      targetType: "INDIVIDUAL",
      targetUserId: userId,
      createdById,
    });
  }

  async sendToRole(role: Role, title: string, body: string, createdById?: number) {
    return this.createAndDeliver({
      title,
      desc: body,
      targetType: "ROLE",
      targetRole: role,
      createdById,
    });
  }

  async sendToDepartment(
    department: string,
    title: string,
    body: string,
    createdById?: number,
  ) {
    return this.createAndDeliver({
      title,
      desc: body,
      targetType: "DEPARTMENT",
      targetDepartment: department,
      department,
      createdById,
    });
  }

  async broadcastAll(title: string, body: string, createdById?: number) {
    return this.createAndDeliver({
      title,
      desc: body,
      targetType: "ALL",
      createdById,
    });
  }

  /**
   * Resolve recipient user IDs for a target.
   */
  async resolveRecipientIds(opts: {
    targetType: NotificationTargetType;
    targetUserId?: number | null;
    targetRole?: Role | null;
    targetDepartment?: string | null;
  }): Promise<number[]> {
    const { targetType } = opts;

    if (targetType === "INDIVIDUAL") {
      return opts.targetUserId ? [opts.targetUserId] : [];
    }

    if (targetType === "ROLE") {
      const users = await prisma.user.findMany({
        where: { role: (opts.targetRole || "USER") as never },
        select: { id: true },
      });
      return users.map((u) => u.id);
    }

    if (targetType === "DEPARTMENT") {
      const users = await prisma.user.findMany({
        where: {
          department: opts.targetDepartment || undefined,
          NOT: { role: "GUEST" as never },
        },
        select: { id: true },
      });
      return users.map((u) => u.id);
    }

    // ALL — every non-guest account
    const users = await prisma.user.findMany({
      where: { NOT: { role: "GUEST" as never } },
      select: { id: true },
    });
    return users.map((u) => u.id);
  }

  /**
   * Write receipts + delivery log + stub device push enqueue.
   */
  async fanOut(
    notificationId: number,
    opts: {
      title: string;
      body: string;
      targetType: NotificationTargetType;
      targetUserId?: number | null;
      targetRole?: Role | null;
      targetDepartment?: string | null;
    },
  ) {
    const recipientIds = await this.resolveRecipientIds(opts);
    const targetKey = buildTargetKey(opts.targetType, opts);
    const now = new Date();

    if (recipientIds.length > 0) {
      await prisma.notificationReceipt.createMany({
        data: recipientIds.map((userId) => ({
          notificationId,
          userId,
          deliveredAt: now,
        })),
        skipDuplicates: true,
      });
    }

    await prisma.notificationLog.create({
      data: {
        notificationId,
        title: opts.title,
        body: opts.body,
        targetType: opts.targetType as never,
        targetKey,
        status: "PENDING" as never,
        sentAt: now,
      },
    });

    // Mobile foundation: collect device tokens for future FCM/APNs worker
    if (recipientIds.length > 0) {
      const tokens = await prisma.deviceToken.findMany({
        where: { userId: { in: recipientIds } },
        select: { id: true, token: true, platform: true, userId: true },
      });

      // Stub: mark log SENT when we have a delivery queue entry point.
      // Real push provider wiring belongs in a background worker.
      if (tokens.length >= 0) {
        await prisma.notificationLog.updateMany({
          where: { notificationId, targetKey, status: "PENDING" as never },
          data: { status: "SENT" as never },
        });
      }

      return { recipientCount: recipientIds.length, deviceTokenCount: tokens.length };
    }

    await prisma.notificationLog.updateMany({
      where: { notificationId, targetKey },
      data: { status: "SENT" as never },
    });

    return { recipientCount: 0, deviceTokenCount: 0 };
  }

  /**
   * Notifications visible to the current user.
   */
  async listForUser(ctx: ListContext) {
    if (ctx.seeAll) {
      return prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
        include: createdByInclude,
      });
    }

    const role = ctx.role;
    const department = ctx.department || undefined;

    return prisma.notification.findMany({
      where: {
        OR: [
          { targetType: "ALL" as never },
          { targetType: "ROLE" as never, targetRole: role as never },
          ...(department
            ? [
                {
                  targetType: "DEPARTMENT" as never,
                  targetDepartment: department,
                },
                // Legacy rows that only set department string
                { department, targetType: "ALL" as never },
              ]
            : []),
          { targetType: "INDIVIDUAL" as never, targetUserId: ctx.id },
          { createdById: ctx.id },
          { receipts: { some: { userId: ctx.id } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: createdByInclude,
    });
  }

  async update(
    id: number,
    data: Partial<
      Pick<
        CreateNotificationInput,
        | "title"
        | "desc"
        | "date"
        | "type"
        | "badge"
        | "badgeColor"
        | "department"
        | "targetType"
        | "targetUserId"
        | "targetRole"
        | "targetDepartment"
      >
    >,
  ) {
    return prisma.notification.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.desc !== undefined ? { desc: data.desc } : {}),
        ...(data.date !== undefined ? { date: data.date } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.badge !== undefined ? { badge: data.badge } : {}),
        ...(data.badgeColor !== undefined ? { badgeColor: data.badgeColor } : {}),
        ...(data.department !== undefined ? { department: data.department } : {}),
        ...(data.targetType !== undefined
          ? { targetType: data.targetType as never }
          : {}),
        ...(data.targetUserId !== undefined
          ? { targetUserId: data.targetUserId }
          : {}),
        ...(data.targetRole !== undefined
          ? { targetRole: data.targetRole as never }
          : {}),
        ...(data.targetDepartment !== undefined
          ? { targetDepartment: data.targetDepartment }
          : {}),
      },
      include: createdByInclude,
    });
  }

  async delete(id: number) {
    // receipts/logs cascade / SetNull via schema
    await prisma.notification.delete({ where: { id } });
    return { success: true };
  }

  async markRead(notificationId: number, userId: number) {
    return prisma.notificationReceipt.upsert({
      where: {
        notificationId_userId: { notificationId, userId },
      },
      create: {
        notificationId,
        userId,
        deliveredAt: new Date(),
        readAt: new Date(),
      },
      update: { readAt: new Date() },
    });
  }

  async getById(id: number) {
    return prisma.notification.findUnique({
      where: { id },
      include: createdByInclude,
    });
  }
}

export const notificationService = new NotificationService();
