/**
 * Next.js 16 Proxy (replaces deprecated middleware.js)
 * First-line gate: mutating /api/* requires a session cookie.
 * Fine-grained RBAC is enforced in route handlers via apiGuards.
 */

import { NextResponse } from "next/server";

const PUBLIC_MUTATING = new Set([
  "/api/auth/login",
]);

function hasAnySessionCookie(request) {
  return (
    request.cookies.has("bama_session_token") ||
    request.cookies.has("bama_auth_session")
  );
}

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  if (!isMutating) {
    return NextResponse.next();
  }

  if (PUBLIC_MUTATING.has(pathname)) {
    return NextResponse.next();
  }

  if (!hasAnySessionCookie(request)) {
    return NextResponse.json(
      { error: "احراز هویت لازم است." },
      { status: 401 },
    );
  }

  // Soft-block obvious GUEST JSON sessions from mutating APIs
  try {
    const raw = request.cookies.get("bama_auth_session")?.value;
    if (raw && !request.cookies.has("bama_session_token")) {
      const parsed = JSON.parse(raw);
      if (parsed?.role === "GUEST") {
        return NextResponse.json(
          { error: "دسترسی میهمان محدود است." },
          { status: 403 },
        );
      }
    }
  } catch {
    // ignore parse errors — route handlers re-validate
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
