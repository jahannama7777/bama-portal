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

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // دریافت سشن کاربر از روی کوکی + دیتابیس
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

  // دریافت لیست کاربران
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
    if (user && (user.role === "SUPERADMIN" || user.role === "ADMIN")) {
      refreshUsers();
    } else {
      setUsersList([]);
    }
  }, [user]);

  // ورود
  const login = async (username, password) => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const result = await loginAction(formData);

      if (result.success) {
        setUser(result.user);

        if (
          result.user.role === "SUPERADMIN" ||
          result.user.role === "ADMIN"
        ) {
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

  // خروج
  const logout = async () => {
    try {
      await logoutAction();
      setUser(null);
      setUsersList([]);
    } catch (error) {
      console.error("خطا در logout:", error);
    }
  };

  // ایجاد کاربر
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

  // حذف کاربر
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

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
  const isSuperAdmin = user?.role === "SUPERADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        usersList,
        loading,
        isAdmin,
        isSuperAdmin,
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
