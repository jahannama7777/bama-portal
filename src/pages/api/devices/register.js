/**
 * File: src/pages/api/devices/register.js
 *
 * باگ بحرانی نسخه قبلی:
 *   import { can } from "../../../lib/rbac";
 * این مسیر به  src/lib/rbac  اشاره می‌کند که اصلاً وجود ندارد
 * (فایل واقعی در ریشه پروژه است: /lib/rbac.ts) → این روت در زمان build
 * با "Module not found" می‌شکست. با alias صحیح @/lib/rbac اصلاح شد.
 */

import { prisma } from "@/src/lib/prisma";
import { can } from "@/lib/rbac";

async function resolveSessionUser(req) {
  const token = req.cookies?.bama_session_token;

  if (token) {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
    if (session?.user && new Date() <= session.expiresAt) {
      const { password: _pw, ...safe } = session.user;
      return safe;
    }
  }

  try {
    const raw = req.cookies?.bama_auth_session;
    if (!raw) return null;
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!parsed?.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: Number(parsed.id) },
    });
    if (!user) return null;

    const { password: _pw, ...safe } = user;
    return safe;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const sessionUser = await resolveSessionUser(req);

    if (!sessionUser || !can.accessAuthenticatedFeatures(sessionUser)) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { userId, token, platform, deviceId } = req.body || {};

    if (!token || !platform || !deviceId) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const validPlatforms = ["IOS", "ANDROID", "WEB"];
    const normalizedPlatform = String(platform).toUpperCase();
    if (!validPlatforms.includes(normalizedPlatform)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid platform" });
    }

    const targetUserId = Number(userId) || sessionUser.id;
    if (targetUserId !== sessionUser.id && !can.isAdmin(sessionUser)) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    // @@unique([userId, deviceId]) در اسکیما وجود دارد → upsert اتمیک و بدون race
    await prisma.deviceToken.upsert({
      where: { userId_deviceId: { userId: targetUserId, deviceId } },
      update: {
        token,
        platform: normalizedPlatform,
        lastUsedAt: new Date(),
      },
      create: {
        userId: targetUserId,
        token,
        platform: normalizedPlatform,
        deviceId,
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error registering device token:", error);
    return res
      .status(500)
      .json({ success: false, error: "Error registering device token" });
  }
}
