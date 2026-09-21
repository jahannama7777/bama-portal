/**
 * Session resolution for App Router API routes & server actions.
 * Supports both cookie strategies used in this project:
 *   - bama_session_token  → DB Session row (authActions / primary)
 *   - bama_auth_session   → JSON user blob (legacy API login)
 */

import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

const SESSION_TOKEN_COOKIE = "bama_session_token";
const SESSION_JSON_COOKIE = "bama_auth_session";

/**
 * @typedef {object} SessionUser
 * @property {number} id
 * @property {string} username
 * @property {string} fullName
 * @property {string|null} department
 * @property {string} role
 * @property {{ action: string, resource: string, granted: boolean }[]} [permissions]
 */

/**
 * @param {string|undefined|null} token
 * @returns {Promise<SessionUser|null>}
 */
async function userFromSessionToken(token) {
  if (!token) return null;

  const dbSession = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          permissions: {
            select: { action: true, resource: true, granted: true },
          },
        },
      },
    },
  });

  if (!dbSession?.user) return null;

  if (new Date() > dbSession.expiresAt) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
    return null;
  }

  const { password: _pw, ...safe } = dbSession.user;
  return {
    id: safe.id,
    username: safe.username,
    fullName: safe.fullName,
    department: safe.department,
    role: safe.role,
    permissions: safe.permissions || [],
  };
}

/**
 * @param {string|undefined|null} raw
 * @returns {Promise<SessionUser|null>}
 */
async function userFromJsonCookie(raw) {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: Number(parsed.id) },
      include: {
        permissions: {
          select: { action: true, resource: true, granted: true },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      department: user.department,
      role: user.role,
      permissions: user.permissions || [],
    };
  } catch {
    return null;
  }
}

/**
 * Resolve the current user from request cookies (App Router).
 * @returns {Promise<SessionUser|null>}
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_TOKEN_COOKIE)?.value;
  const fromToken = await userFromSessionToken(token);
  if (fromToken) return fromToken;

  const jsonCookie = cookieStore.get(SESSION_JSON_COOKIE)?.value;
  return userFromJsonCookie(jsonCookie);
}

/**
 * Resolve user from a NextRequest (Route Handlers / Proxy-friendly cookie read).
 * @param {import('next/server').NextRequest | Request} req
 * @returns {Promise<SessionUser|null>}
 */
export async function getCurrentUserFromRequest(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const map = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        const i = c.indexOf("=");
        return i === -1 ? [c, ""] : [c.slice(0, i), decodeURIComponent(c.slice(i + 1))];
      }),
  );

  const fromToken = await userFromSessionToken(map[SESSION_TOKEN_COOKIE]);
  if (fromToken) return fromToken;

  return userFromJsonCookie(map[SESSION_JSON_COOKIE]);
}

export { SESSION_TOKEN_COOKIE, SESSION_JSON_COOKIE };
