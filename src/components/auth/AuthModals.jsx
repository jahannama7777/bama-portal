"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { loginAction, createUserAction, getUsersAction } from "@/src/app/actions/authActions";

export default function AuthModals() {
  const {
    user,
    setUser,
    isAdmin,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isUserManagementOpen,
    setIsUserManagementOpen,
  } = useAuth();

  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [newUserMsg, setNewUserMsg] = useState("");

  useEffect(() => {
    if (isUserManagementOpen && isAdmin) {
      getUsersAction().then(setUsersList);
    }
  }, [isUserManagementOpen, isAdmin]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError("");
    const formData = new FormData(e.target);
    const res = await loginAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setUser(res.user);
      setIsLoginModalOpen(false);
    } else {
      setLoginError(res.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setNewUserMsg("");
    const form = e.target;
    const formData = new FormData(form);
    const res = await createUserAction(formData);

    if (res.success) {
      setNewUserMsg("کاربر جدید با موفقیت اضافه شد.");
      form.reset();
      const updated = await getUsersAction();
      setUsersList(updated);
    } else {
      setNewUserMsg(res.message);
    }
  };

  return (
    <>
      {/* مدال ورود */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-4 text-cyan-400">ورود به پنل مدیریت</h3>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">نام کاربری</label>
                <input
                  name="username"
                  type="text"
                  required
                  placeholder="admin"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">کلمه عبور</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="admin123"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {loginError && <div className="text-rose-400 text-xs">{loginError}</div>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-cyan-600 hover:bg-cyan-500 transition-colors py-2 rounded-lg font-medium text-sm text-white"
              >
                {isSubmitting ? "در حال بررسی..." : "ورود به حساب"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* مدال مدیریت و تعریف نقش کاربران */}
      {isUserManagementOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setIsUserManagementOpen(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white text-lg"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-6 text-cyan-400">مدیریت کاربران و دسترسی‌ها</h3>

            {/* فرم ثبت کاربر جدید */}
            <form onSubmit={handleCreateUser} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">نام کاربری</label>
                <input name="username" required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">نام و نام خانوادگی</label>
                <input name="fullName" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">کلمه عبور</label>
                <input name="password" type="password" required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">نقش کاربری</label>
                <select name="role" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white">
                  <option value="ADMIN">مدیر (ADMIN)</option>
                  <option value="USER">کاربر ساده (USER)</option>
                  <option value="GUEST">میهمان (GUEST)</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-center justify-between mt-2">
                {newUserMsg && <span className="text-xs text-cyan-400">{newUserMsg}</span>}
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-medium mr-auto">
                  + ایجاد کاربر
                </button>
              </div>
            </form>

            {/* لیست کاربران */}
            <h4 className="text-sm font-semibold mb-3 text-slate-300">لیست کاربران ثبت‌شده:</h4>
            <div className="space-y-2">
              {usersList.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-800 rounded-lg">
                  <div>
                    <span className="font-semibold text-white">{u.fullName || u.username}</span>
                    <span className="text-xs text-slate-400 mr-2">({u.username})</span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    u.role === "SUPERADMIN" ? "bg-purple-900/60 text-purple-300" :
                    u.role === "ADMIN" ? "bg-cyan-900/60 text-cyan-300" :
                    u.role === "USER" ? "bg-emerald-900/60 text-emerald-300" :
                    "bg-slate-700 text-slate-300"
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
