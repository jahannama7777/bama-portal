import { prisma } from "../../../lib/prisma";
import { can } from "../../../lib/rbac";

async function resolveSessionUser(req) {
  const token = req.cookies?.bama_session_token;
  if (token) {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
    if (session?.user && new Date() <= session.expiresAt) {
      const { password: _, ...safe } = session.user;
      return safe;
    }
  }

  try {
    const raw = req.cookies?.bama_auth_session;
    if (!raw) return null;
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!parsed?.id) return null;
    const user = await prisma.user.findUnique({ where: { id: Number(parsed.id) } });
    if (!user) return null;
    const { password: _, ...safe } = user;
    return safe;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
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

    const targetUserId = Number(userId) || sessionUser.id;
    if (targetUserId !== sessionUser.id && !can.isAdmin(sessionUser)) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const existingToken = await prisma.deviceToken.findFirst({
      where: { userId: targetUserId, deviceId },
    });

    if (existingToken) {
      await prisma.deviceToken.update({
        where: { id: existingToken.id },
        data: { token, platform, lastUsedAt: new Date() },
      });
    } else {
      await prisma.deviceToken.create({
        data: {
          userId: targetUserId,
          token,
          platform,
          deviceId,
        },
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error registering device token:", error);
    return res
      .status(500)
      .json({ success: false, error: "Error registering device token" });
  }
}
