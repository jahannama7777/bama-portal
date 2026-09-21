/**
 * API route guards — use inside Route Handlers / server actions.
 * Pair with proxy.js for a cheap cookie-presence check on mutating /api/*.
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/session";
import {
  hasPermission,
  canAccess,
  canAccessApp,
  canCreateRole,
  can,
} from "@/lib/rbac";

/**
 * @param {import('@/lib/rbac').Permission} [permission]
 * @param {import('@/lib/rbac').Role} [minimumRole]
 */
export async function requireAuth(options = {}) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "احراز هویت لازم است. لطفاً وارد شوید." },
        { status: 401 },
      ),
    };
  }

  if (can.isGuest(user) && options.allowGuest !== true) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "دسترسی میهمان محدود است. لطفاً وارد شوید." },
        { status: 403 },
      ),
    };
  }

  if (options.permission && !hasPermission(user, options.permission)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "شما مجوز انجام این عملیات را ندارید." },
        { status: 403 },
      ),
    };
  }

  if (options.minimumRole && !canAccess(user, options.minimumRole)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "سطح دسترسی کافی نیست." },
        { status: 403 },
      ),
    };
  }

  return { user, error: null };
}

export async function requirePermission(permission) {
  return requireAuth({ permission });
}

export {
  hasPermission,
  canAccess,
  canAccessApp,
  canCreateRole,
  can,
  getCurrentUser,
};
