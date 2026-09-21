/**
 * Bama Portal — Role-Based Access Control (RBAC)
 *
 * Hierarchy (high → low):
 *   SUPERADMIN > ADMIN > SUPERVISOR > USER > GUEST
 *
 * Usage:
 *   hasPermission(user, "MANAGE_APPS")
 *   canAccess(user, "SUPERVISOR")   // role rank >= SUPERVISOR
 *   canAccessApp(user, app)
 *   canCreateRole(actor, "ADMIN")
 */

export type Role = "SUPERADMIN" | "ADMIN" | "SUPERVISOR" | "USER" | "GUEST";

/** Named permissions used across API, UI, and server actions */
export type Permission =
  | "MANAGE_USERS"
  | "CREATE_ADMIN"
  | "CREATE_SUPERADMIN"
  | "MANAGE_APPS"
  | "APPLY_USER_RESTRICTIONS"
  | "MODERATE_COMMENTS"
  | "EDIT_ANY_ANNOUNCEMENT"
  | "EDIT_OWN_ANNOUNCEMENT"
  | "VIEW_ASSIGNED_APPS"
  | "VIEW_ANNOUNCEMENTS"
  | "SUBMIT_COMMENT"
  | "VIEW_PORTAL_OVERVIEW"
  | "SEND_NOTIFICATIONS"
  | "ACCESS_AUTHENTICATED_FEATURES";

export type PermissionOverride = {
  action: string;
  resource: string;
  granted: boolean;
};

export type RbacUser = {
  id?: number;
  role: Role | string;
  department?: string | null;
  /** Optional fine-grained overrides from UserPermission */
  permissions?: PermissionOverride[];
};

export type AppLike = {
  id?: number;
  roles?: string | string[] | null;
  /** Optional per-user override from UserAppAccess.allowed */
  userAllowed?: boolean | null;
};

/** Numeric rank — higher number = more privilege */
export const ROLE_RANK: Record<Role, number> = {
  GUEST: 0,
  USER: 1,
  SUPERVISOR: 2,
  ADMIN: 3,
  SUPERADMIN: 4,
};

export const ALL_ROLES: Role[] = [
  "SUPERADMIN",
  "ADMIN",
  "SUPERVISOR",
  "USER",
  "GUEST",
];

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  SUPERADMIN: [
    "MANAGE_USERS",
    "CREATE_ADMIN",
    "CREATE_SUPERADMIN",
    "MANAGE_APPS",
    "APPLY_USER_RESTRICTIONS",
    "MODERATE_COMMENTS",
    "EDIT_ANY_ANNOUNCEMENT",
    "EDIT_OWN_ANNOUNCEMENT",
    "VIEW_ASSIGNED_APPS",
    "VIEW_ANNOUNCEMENTS",
    "SUBMIT_COMMENT",
    "VIEW_PORTAL_OVERVIEW",
    "SEND_NOTIFICATIONS",
    "ACCESS_AUTHENTICATED_FEATURES",
  ],
  ADMIN: [
    "MANAGE_USERS",
    "CREATE_ADMIN",
    "MANAGE_APPS",
    "APPLY_USER_RESTRICTIONS",
    "MODERATE_COMMENTS",
    "EDIT_ANY_ANNOUNCEMENT",
    "EDIT_OWN_ANNOUNCEMENT",
    "VIEW_ASSIGNED_APPS",
    "VIEW_ANNOUNCEMENTS",
    "SUBMIT_COMMENT",
    "VIEW_PORTAL_OVERVIEW",
    "SEND_NOTIFICATIONS",
    "ACCESS_AUTHENTICATED_FEATURES",
  ],
  SUPERVISOR: [
    "EDIT_OWN_ANNOUNCEMENT",
    "VIEW_ASSIGNED_APPS",
    "VIEW_ANNOUNCEMENTS",
    "SUBMIT_COMMENT",
    "VIEW_PORTAL_OVERVIEW",
    "ACCESS_AUTHENTICATED_FEATURES",
  ],
  USER: [
    "VIEW_ASSIGNED_APPS",
    "VIEW_ANNOUNCEMENTS",
    "SUBMIT_COMMENT",
    "VIEW_PORTAL_OVERVIEW",
    "ACCESS_AUTHENTICATED_FEATURES",
  ],
  GUEST: ["VIEW_PORTAL_OVERVIEW"],
};

function normalizeRole(role: unknown): Role {
  if (typeof role === "string" && role in ROLE_RANK) {
    return role as Role;
  }
  return "GUEST";
}

function parseAppRoles(roles: AppLike["roles"]): Role[] {
  if (!roles) return ["USER", "ADMIN", "SUPERADMIN", "SUPERVISOR"];
  if (Array.isArray(roles)) {
    return roles.map(normalizeRole);
  }
  try {
    const parsed = JSON.parse(roles);
    if (Array.isArray(parsed)) return parsed.map(normalizeRole);
  } catch {
    // plain comma-separated fallback
    return roles
      .split(",")
      .map((r) => normalizeRole(r.trim()))
      .filter(Boolean);
  }
  return ["USER", "ADMIN", "SUPERADMIN", "SUPERVISOR"];
}

/**
 * Minimum-role gate.
 * `canAccess(user, "SUPERVISOR")` → true if rank(user) >= rank(SUPERVISOR)
 */
export function canAccess(
  user: RbacUser | null | undefined,
  minimumRole: Role,
): boolean {
  if (!user) return false;
  return ROLE_RANK[normalizeRole(user.role)] >= ROLE_RANK[minimumRole];
}

/**
 * Named permission check with optional UserPermission overrides.
 * Override match: action === permission (resource "*" or exact later in Step 2).
 */
export function hasPermission(
  user: RbacUser | null | undefined,
  permission: Permission,
): boolean {
  if (!user) {
    return permission === "VIEW_PORTAL_OVERVIEW";
  }

  const role = normalizeRole(user.role);

  // Explicit deny / grant overrides win over role defaults
  if (user.permissions?.length) {
    const deny = user.permissions.find(
      (p) => p.action === permission && p.granted === false,
    );
    if (deny) return false;

    const grant = user.permissions.find(
      (p) => p.action === permission && p.granted === true,
    );
    if (grant) return true;
  }

  return ROLE_PERMISSIONS[role].includes(permission);
}

/** True when the actor may assign `targetRole` to another user */
export function canCreateRole(
  actor: RbacUser | null | undefined,
  targetRole: Role | string,
): boolean {
  if (!actor) return false;
  const actorRole = normalizeRole(actor.role);
  const target = normalizeRole(targetRole);

  if (actorRole === "SUPERADMIN") return true;
  if (actorRole === "ADMIN") {
    // Admin may create SUPERVISOR, USER, GUEST — not ADMIN/SUPERADMIN
    return ROLE_RANK[target] < ROLE_RANK.ADMIN;
  }
  return false;
}

/**
 * App Launcher visibility.
 * - No user / GUEST → false
 * - SUPERADMIN → always true
 * - Otherwise role must be listed on the app
 * - UserAppAccess.allowed === false forces deny; true forces allow
 */
export function canAccessApp(
  user: RbacUser | null | undefined,
  app: AppLike | null | undefined,
): boolean {
  if (!app) return false;
  if (!user || normalizeRole(user.role) === "GUEST") return false;

  if (typeof app.userAllowed === "boolean") {
    return app.userAllowed;
  }

  if (normalizeRole(user.role) === "SUPERADMIN") return true;

  const allowedRoles = parseAppRoles(app.roles);
  return allowedRoles.includes(normalizeRole(user.role));
}

/** Convenience wrappers matching common call sites */
export const can = {
  manageUsers: (u: RbacUser | null | undefined) =>
    hasPermission(u, "MANAGE_USERS"),
  manageApps: (u: RbacUser | null | undefined) =>
    hasPermission(u, "MANAGE_APPS"),
  applyUserRestrictions: (u: RbacUser | null | undefined) =>
    hasPermission(u, "APPLY_USER_RESTRICTIONS"),
  moderateComments: (u: RbacUser | null | undefined) =>
    hasPermission(u, "MODERATE_COMMENTS"),
  editAnyAnnouncement: (u: RbacUser | null | undefined) =>
    hasPermission(u, "EDIT_ANY_ANNOUNCEMENT"),
  editOwnAnnouncement: (u: RbacUser | null | undefined) =>
    hasPermission(u, "EDIT_OWN_ANNOUNCEMENT"),
  sendNotifications: (u: RbacUser | null | undefined) =>
    hasPermission(u, "SEND_NOTIFICATIONS"),
  viewAssignedApps: (u: RbacUser | null | undefined) =>
    hasPermission(u, "VIEW_ASSIGNED_APPS"),
  submitComment: (u: RbacUser | null | undefined) =>
    hasPermission(u, "SUBMIT_COMMENT"),
  accessAuthenticatedFeatures: (u: RbacUser | null | undefined) =>
    hasPermission(u, "ACCESS_AUTHENTICATED_FEATURES"),
  isGuest: (u: RbacUser | null | undefined) =>
    !u || normalizeRole(u.role) === "GUEST",
  isSuperAdmin: (u: RbacUser | null | undefined) =>
    normalizeRole(u?.role) === "SUPERADMIN",
  isAdmin: (u: RbacUser | null | undefined) =>
    normalizeRole(u?.role) === "ADMIN" ||
    normalizeRole(u?.role) === "SUPERADMIN",
  isSupervisor: (u: RbacUser | null | undefined) =>
    normalizeRole(u?.role) === "SUPERVISOR",
};

export function getRolePermissions(role: Role | string): readonly Permission[] {
  return ROLE_PERMISSIONS[normalizeRole(role)];
}
