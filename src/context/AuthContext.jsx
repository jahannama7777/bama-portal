"use client";

/**
 * File: src/context/AuthContext.jsx
 *
 * تغییرات:
 *  1. اکشن updateUser اضافه شد (پیش‌نیاز فرم «ویرایش کاربر» در مدال مدیریت).
 *  2. خروجی همه اکشن‌ها یکدست شد: همیشه { success, message, user? }
 *     — قبلاً بعضی جاها message و بعضی جاها error برمی‌گشت و UI پیام خطا را
 *     نشان نمی‌داد.
 *  3. useEffect وابسته به `user` به `user?.role` وابسته شد تا با هر بار
 *     ست شدن مجدد همان کاربر، لیست کاربران دوباره fetch نشود.
 *  4. useAuth حالا اگر خارج از Provider صدا زده شود خطای واضح می‌دهد
 *     به‌جای TypeError مبهم "Cannot destructure property of undefined".
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  loginAction,
  logoutAction,
  getSessionAction,
  getUsersAction,
  createUserAction,
  updateUserAction,
  deleteUserAction,
} from "@/src/app/actions/authActions";
import {
  can,
  hasPermission,
  canAccess,
  canAccessApp,
  canCreateRole,
} from "@/lib/rbac";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await getSessionAction();
      setUser(currentUser);
    } catch (error) {
      console.error("خطا در refreshSession:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const list = await getUsersAction();
      setUsersList(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("خطا در refreshUsers:", error);
      setUsersList([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // وابسته به role و id، نه به آبجکت user (جلوگیری از fetch تکراری)
  useEffect(() => {
    if (can.manageUsers(user)) {
      refreshUsers();
    } else {
      setUsersList([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role, refreshUsers]);

  const login = useCallback(
    async (username, password) => {
      try {
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        const result = await loginAction(formData);

        if (result?.success) {
          setUser(result.user);
          if (can.manageUsers(result.user)) {
            await refreshUsers();
          }
        }

        return result;
      } catch (error) {
        console.error("خطا در login:", error);
        return { success: false, message: "خطا در ورود به سیستم." };
      }
    },
    [refreshUsers],
  );

  const logout = useCallback(async () => {
    try {
      const result = await logoutAction();
      setUser(null);
      setUsersList([]);
      return result;
    } catch (error) {
      console.error("خطا در logout:", error);
      return { success: false, message: "خطا در خروج از سیستم." };
    }
  }, []);

  const addUser = useCallback(
    async ({ username, fullName, department, password, role }) => {
      try {
        const formData = new FormData();
        formData.append("username", username || "");
        formData.append("fullName", fullName || "");
        formData.append("department", department || "");
        formData.append("password", password || "");
        formData.append("role", role || "USER");

        const result = await createUserAction(formData);
        if (result?.success) await refreshUsers();
        return result;
      } catch (error) {
        console.error("خطا در addUser:", error);
        return { success: false, message: "خطا در ایجاد کاربر." };
      }
    },
    [refreshUsers],
  );

  const updateUser = useCallback(
    async (id, payload) => {
      try {
        const result = await updateUserAction(id, payload || {});
        if (result?.success) {
          await refreshUsers();
          // اگر کاربر جاری خودش را ویرایش کرده، سشن را هم تازه کن
          if (Number(id) === Number(user?.id)) {
            await refreshSession();
          }
        }
        return result;
      } catch (error) {
        console.error("خطا در updateUser:", error);
        return { success: false, message: "خطا در ویرایش کاربر." };
      }
    },
    [refreshUsers, refreshSession, user?.id],
  );

  const deleteUser = useCallback(
    async (id) => {
      try {
        const result = await deleteUserAction(id);
        if (result?.success) await refreshUsers();
        return result;
      } catch (error) {
        console.error("خطا در deleteUser:", error);
        return { success: false, message: "خطا در حذف کاربر." };
      }
    },
    [refreshUsers],
  );

  const value = useMemo(() => {
    return {
      user,
      setUser,
      usersList,
      usersLoading,
      loading,
      currentRole: user?.role || "GUEST",
      isAdmin: can.isAdmin(user),
      isSuperAdmin: can.isSuperAdmin(user),
      isSupervisor: can.isSupervisor(user),
      isGuest: can.isGuest(user),
      lowLevelAdmin: user?.role === "ADMIN",

      // RBAC surface
      can,
      hasPermission: (permission) => hasPermission(user, permission),
      canAccess: (minRole) => canAccess(user, minRole),
      canAccessApp: (app) => canAccessApp(user, app),
      canCreateRole: (role) => canCreateRole(user, role),

      login,
      logout,
      addUser,
      updateUser,
      deleteUser,
      refreshSession,
      refreshUsers,
    };
  }, [
    user,
    usersList,
    usersLoading,
    loading,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
    refreshSession,
    refreshUsers,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth باید داخل <AuthProvider> استفاده شود.");
  }
  return context;
};

export default AuthContext;
