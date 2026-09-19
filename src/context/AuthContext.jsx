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

// تعریف دپارتمان‌های مجاز برای دسترسی مدیریتی
const allowedDepartments = ["فناوری اطلاعات", "فناوری اطلاعات و ارتباطات", "IT"];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // تابع کمکی برای بررسی دسترسی مدیریتی
  const checkIsAdminWithAccess = (userObj) => {
    if (!userObj) return false;
    if (userObj.role === "SUPERADMIN") return true;
    if (userObj.role === "ADMIN" && userObj.department.includes(allowedDepartments)) return true;
    return false;
  };

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
    // استفاده از تابع کمکی برای چک کردن دسترسی
    if (checkIsAdminWithAccess(user)) {
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

        // اگر کاربر لاگین شده دسترسی ادمین دارد، لیست کاربران را هم بگیر
        if (checkIsAdminWithAccess(result.user)) {
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

  // هوک‌ها و وضعیت‌ها
  const isSuperAdmin = user?.role === "SUPERADMIN";
  
  // دسترسی ادمین (یا سوپر ادمین) که دپارتمان مجاز دارد
  const isAdmin = checkIsAdminWithAccess(user);
  const lowLevelAdmin = user?.role === "ADMIN"

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
        allowedDepartments,
        lowLevelAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
