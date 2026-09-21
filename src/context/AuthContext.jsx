"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  loginAction,
  logoutAction,
  getSessionAction,
  getUsersAction,
  createUserAction,
  deleteUserAction,
} from "@/src/app/actions/authActions";
import {
  can,
  hasPermission,
  canAccess,
  canAccessApp,
  canCreateRole,
} from "@/lib/rbac";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
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
  };

  const refreshUsers = async () => {
    try {
      const list = await getUsersAction();
      setUsersList(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("خطا در refreshUsers:", error);
      setUsersList([]);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  useEffect(() => {
    if (can.manageUsers(user)) {
      refreshUsers();
    } else {
      setUsersList([]);
    }
  }, [user]);

  const login = async (username, password) => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const result = await loginAction(formData);

      if (result.success) {
        setUser(result.user);
        if (can.manageUsers(result.user)) {
          await refreshUsers();
        }
      }

      return result;
    } catch (error) {
      console.error("خطا در login:", error);
      return {
        success: false,
        message: "خطا در ورود به سیستم.",
      };
    }
  };

  const logout = async () => {
    try {
      await logoutAction();
      setUser(null);
      setUsersList([]);
    } catch (error) {
      console.error("خطا در logout:", error);
    }
  };

  const addUser = async ({ username, fullName, department, password, role }) => {
    try {
      const formData = new FormData();
      formData.append("username", username || "");
      formData.append("fullName", fullName || "");
      formData.append("department", department || "");
      formData.append("password", password || "");
      formData.append("role", role || "USER");

      const result = await createUserAction(formData);

      if (result.success) {
        await refreshUsers();
      }

      return result;
    } catch (error) {
      console.error("خطا در addUser:", error);
      return {
        success: false,
        message: "خطا در ایجاد کاربر.",
      };
    }
  };

  const deleteUser = async (id) => {
    try {
      const result = await deleteUserAction(id);

      if (result.success) {
        await refreshUsers();
      }

      return result;
    } catch (error) {
      console.error("خطا در deleteUser:", error);
      return {
        success: false,
        message: "خطا در حذف کاربر.",
      };
    }
  };

  const currentRole = user?.role || "GUEST";
  const isSuperAdmin = can.isSuperAdmin(user);
  const isAdmin = can.isAdmin(user);
  const isSupervisor = can.isSupervisor(user);
  const isGuest = can.isGuest(user);
  const lowLevelAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        usersList,
        loading,
        currentRole,
        isAdmin,
        isSuperAdmin,
        isSupervisor,
        isGuest,
        lowLevelAdmin,
        // RBAC surface
        can,
        hasPermission: (permission) => hasPermission(user, permission),
        canAccess: (minRole) => canAccess(user, minRole),
        canAccessApp: (app) => canAccessApp(user, app),
        canCreateRole: (role) => canCreateRole(user, role),
        login,
        logout,
        addUser,
        deleteUser,
        refreshSession,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
