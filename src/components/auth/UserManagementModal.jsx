"use client";

/**
 * File: src/components/auth/UserManagementModal.jsx
 *
 * بازنویسی کامل. باگ‌هایی که در نسخه قبلی رفع شد:
 *
 *  1. نبود دستور "use client" — کامپوننت فقط به این دلیل کار می‌کرد که از یک
 *     کامپوننت کلاینتی import شده بود. هر بار که از یک Server Component صدا
 *     زده می‌شد، با خطای useState می‌افتاد.
 *
 *  2. مسیر اشتباه API: fetch("/api/users/:id/access") در حالی که روت واقعی
 *     زیر /api/auth/users/... بود → همیشه 404. و چون بلوک catch به‌صورت
 *     «fallback» تمام سامانه‌ها را hasAccess: true می‌گذاشت، کاربر فکر می‌کرد
 *     دسترسی‌ها لود شده‌اند، بعد Save می‌زد و همه دسترسی‌ها را باز می‌کرد.
 *     این خطرناک‌ترین باگ پروژه بود. حالا مسیر درست است و در صورت خطا،
 *     هیچ fallback گمراه‌کننده‌ای وجود ندارد — خطا صریح نمایش داده می‌شود.
 *
 *  3. خواندن data.error در حالی که API همیشه message برمی‌گرداند → پیام خطا
 *     هرگز نمایش داده نمی‌شد.
 *
 *  4. نبود قابلیت «ویرایش کاربر» (در صورت‌ خواسته بود ولی پیاده نشده بود).
 *
 *  5. نبود spinner هنگام ایجاد/حذف/ذخیره و نبود قفل دکمه‌ها (double-submit).
 *
 *  6. مقایسه شناسه‌ها بدون نرمال‌سازی (12 در برابر "12").
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  UserPlus,
  UserCog,
  Trash2,
  Users,
  AlertTriangle,
  Layers,
  Check,
  Loader2,
  Search,
  AppWindow,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";

/** شناسه سامانه را همیشه به Int تبدیل می‌کند (هماهنگ با Prisma) */
function toAppId(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? value : null;
  }
  const match = String(value).trim().match(/(\d+)\s*$/);
  if (!match) return null;
  const parsed = Number.parseInt(match[1], 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

const ROLE_BADGES = {
  SUPERADMIN: {
    label: "مدیر ارشد",
    color:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  ADMIN: {
    label: "ادمین سیستم",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  },
  SUPERVISOR: {
    label: "سرپرست",
    color:
      "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  USER: {
    label: "پرسنل",
    color:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  GUEST: {
    label: "میهمان",
    color:
      "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
};

const EMPTY_FORM = {
  id: null,
  fullName: "",
  username: "",
  password: "",
  role: "USER",
  department: "",
};

const INPUT_CLASS =
  "w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 dark:text-white disabled:opacity-50";

export default function UserManagementModal({ isOpen, onClose }) {
  const {
    usersList,
    usersLoading,
    addUser,
    updateUser,
    deleteUser,
    refreshUsers,
    user: currentUser,
    isSuperAdmin,
  } = useAuth();
  const { showToast } = useToast();

  // ---------- فرم ایجاد / ویرایش کاربر ----------
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const isEditing = form.id !== null;

  // ---------- پنل دسترسی سامانه‌ها ----------
  const [selectedUserForApps, setSelectedUserForApps] = useState(null);
  const [userApps, setUserApps] = useState([]);
  const [appSearchTerm, setAppSearchTerm] = useState("");
  const [loadingApps, setLoadingApps] = useState(false);
  const [appsError, setAppsError] = useState(null);
  const [savingApps, setSavingApps] = useState(false);

  // ---------- مدال تایید حذف ----------
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: null,
    name: "",
  });
  const [deleting, setDeleting] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // با بسته شدن مدال، همه‌چیز ریست شود
  useEffect(() => {
    if (!isOpen) {
      setForm(EMPTY_FORM);
      setSelectedUserForApps(null);
      setUserApps([]);
      setAppSearchTerm("");
      setAppsError(null);
      setConfirmDelete({ open: false, id: null, name: "" });
    }
  }, [isOpen]);

  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  /* ----------------------------------------------- ایجاد / ویرایش کاربر */

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const fullName = form.fullName.trim();
    const username = form.username.trim();
    const password = form.password;

    if (!fullName || !username) {
      showToast("نام و نام کاربری الزامی است.", "error");
      return;
    }
    if (!isEditing && !password) {
      showToast("برای کاربر جدید، رمز عبور الزامی است.", "error");
      return;
    }
    if (password && password.length < 6) {
      showToast("رمز عبور باید حداقل ۶ کاراکتر باشد.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName,
        username,
        department: form.department.trim(),
        role: form.role,
      };

      const res = isEditing
        ? await updateUser(form.id, {
            ...payload,
            ...(password ? { password } : {}),
          })
        : await addUser({ ...payload, password });

      if (res?.success) {
        showToast(
          res.message ||
            (isEditing
              ? `اطلاعات «${fullName}» به‌روزرسانی شد.`
              : `حساب کاربری «${fullName}» ایجاد شد.`),
          "success",
        );
        setForm(EMPTY_FORM);
      } else {
        showToast(res?.message || "عملیات ناموفق بود.", "error", {
          title: isEditing ? "ویرایش انجام نشد" : "ایجاد کاربر ناموفق",
        });
      }
    } catch (err) {
      console.error(err);
      showToast("خطا در برقراری ارتباط با سرور.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (u) => {
    setForm({
      id: u.id,
      fullName: u.fullName || "",
      username: u.username || "",
      password: "",
      role: u.role || "USER",
      department: u.department || "",
    });
  };

  const cancelEdit = () => setForm(EMPTY_FORM);

  /* ------------------------------------------------ دسترسی به سامانه‌ها */

  const loadUserApps = useCallback(
    async (targetUser) => {
      setLoadingApps(true);
      setAppsError(null);
      try {
        const res = await fetch(`/api/users/${targetUser.id}/access`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          // هیچ fallback «همه مجاز» نداریم — سکوت در این نقطه یعنی باز کردن
          // ناخواسته تمام دسترسی‌ها هنگام ذخیره.
          setUserApps([]);
          setAppsError(
            data?.message || `خطا در دریافت دسترسی‌ها (کد ${res.status})`,
          );
          return;
        }

        const apps = Array.isArray(data.apps) ? data.apps : [];
        setUserApps(
          apps
            .map((a) => ({ ...a, id: toAppId(a.id), hasAccess: !!a.hasAccess }))
            .filter((a) => a.id !== null),
        );
      } catch (err) {
        console.error(err);
        setUserApps([]);
        setAppsError("خطا در برقراری ارتباط با سرور.");
      } finally {
        setLoadingApps(false);
      }
    },
    [],
  );

  const handleOpenAppAccess = async (targetUser) => {
    setSelectedUserForApps(targetUser);
    setAppSearchTerm("");
    await loadUserApps(targetUser);
  };

  const handleToggleApp = (appId) => {
    const id = toAppId(appId);
    setUserApps((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, hasAccess: !app.hasAccess } : app,
      ),
    );
  };

  const handleSelectAllApps = (selectAll) => {
    const visibleIds = new Set(filteredApps.map((a) => a.id));
    setUserApps((prev) =>
      prev.map((app) =>
        visibleIds.has(app.id) ? { ...app, hasAccess: selectAll } : app,
      ),
    );
  };

  const handleSaveAppAccess = async () => {
    if (!selectedUserForApps || savingApps) return;

    if (appsError) {
      showToast(
        "تا زمانی که لیست دسترسی‌ها با موفقیت بارگذاری نشده، ذخیره ممکن نیست.",
        "warning",
      );
      return;
    }

    setSavingApps(true);
    try {
      const allowedAppIds = userApps
        .filter((app) => app.hasAccess)
        .map((app) => app.id) // تضمیناً Int
        .filter((id) => id !== null);

      const res = await fetch(`/api/users/${selectedUserForApps.id}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowedAppIds }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.success !== false) {
        showToast(
          data?.message ||
            `دسترسی‌های «${selectedUserForApps.fullName}» ذخیره شد.`,
          "success",
        );
        setSelectedUserForApps(null);
        setUserApps([]);
      } else {
        showToast(data?.message || "خطا در ذخیره‌سازی دسترسی‌ها.", "error", {
          title: "ذخیره انجام نشد",
        });
      }
    } catch (err) {
      console.error(err);
      showToast("خطا در برقراری ارتباط با سرور.", "error");
    } finally {
      setSavingApps(false);
    }
  };

  /* -------------------------------------------------------- حذف کاربر */

  const askDelete = (id, name) => setConfirmDelete({ open: true, id, name });

  const handleFinalDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await deleteUser(confirmDelete.id);
      if (res?.success) {
        showToast(
          res.message || `کاربر «${confirmDelete.name}» حذف شد.`,
          "success",
        );
        if (form.id === confirmDelete.id) setForm(EMPTY_FORM);
      } else {
        showToast(res?.message || "خطا در حذف کاربر.", "error", {
          title: "حذف انجام نشد",
        });
      }
    } catch (err) {
      console.error(err);
      showToast("خطا در حذف کاربر رخ داد.", "error");
    } finally {
      setDeleting(false);
      setConfirmDelete({ open: false, id: null, name: "" });
    }
  };

  /* ------------------------------------------------------------ مشتقات */

  const filteredApps = useMemo(() => {
    const term = appSearchTerm.trim().toLowerCase();
    if (!term) return userApps;
    return userApps.filter(
      (app) =>
        (app.titleFa || app.title || "").toLowerCase().includes(term) ||
        (app.titleEn || "").toLowerCase().includes(term) ||
        (app.desc || "").toLowerCase().includes(term),
    );
  }, [userApps, appSearchTerm]);

  const allowedCount = useMemo(
    () => userApps.filter((a) => a.hasAccess).length,
    [userApps],
  );

  if (!isOpen) return null;

  return (
    <>
      {/* ------------------------------ مدال تایید حذف (Portal) ---------- */}
      {mounted &&
        confirmDelete.open &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              dir="rtl"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 fade-in duration-200"
            >
              <div className="flex items-center gap-3 text-rose-500 mb-4">
                <div className="p-2 rounded-xl bg-rose-500/10">
                  <AlertTriangle size={24} />
                </div>
                <h4 className="font-bold">حذف حساب کاربری</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                آیا از حذف کاربر «{confirmDelete.name}» اطمینان دارید؟ این عمل
                برگشت‌پذیر نیست.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleFinalDelete}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {deleting && <Loader2 size={13} className="animate-spin" />}
                  بله، حذف شود
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() =>
                    setConfirmDelete({ open: false, id: null, name: "" })
                  }
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-60 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* ------------------------------ مدال اصلی مدیریت کاربران --------- */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
        <div
          className="relative w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl p-5 md:p-6 text-slate-800 dark:text-white max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200"
          dir="rtl"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer z-10"
            aria-label="بستن"
          >
            <X size={18} />
          </button>

          {/* سربرگ */}
          <div className="flex items-center gap-3 mb-5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-inner">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                مدیریت کاربران و سطوح دسترسی
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                تعریف پرسنل جدید، ویرایش نقش و تخصیص مستقیم دسترسی به سامانه‌ها
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-5 custom-scrollbar">
            {/* -------------------- فرم ایجاد / ویرایش -------------------- */}
            <form
              onSubmit={handleSubmitUser}
              className={`p-4 rounded-2xl border space-y-3 transition-colors ${
                isEditing
                  ? "bg-amber-50 dark:bg-amber-500/5 border-amber-300/60 dark:border-amber-500/20"
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-white/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <h4
                  className={`text-xs font-bold flex items-center gap-1.5 ${
                    isEditing
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-cyan-600 dark:text-cyan-400"
                  }`}
                >
                  {isEditing ? <UserCog size={15} /> : <UserPlus size={15} />}
                  {isEditing
                    ? `ویرایش کاربر: ${form.fullName || form.username}`
                    : "ایجاد دسترسی جدید"}
                </h4>

                {isEditing && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    انصراف از ویرایش
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                  placeholder="نام و نام خانوادگی"
                  disabled={submitting}
                  className={INPUT_CLASS}
                />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setField("username", e.target.value)}
                  placeholder="نام کاربری (انگلیسی)"
                  dir="ltr"
                  autoComplete="off"
                  disabled={submitting}
                  className={`${INPUT_CLASS} font-mono`}
                />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  placeholder={
                    isEditing
                      ? "رمز جدید (خالی = بدون تغییر)"
                      : "رمز عبور (حداقل ۶ کاراکتر)"
                  }
                  dir="ltr"
                  autoComplete="new-password"
                  disabled={submitting}
                  className={`${INPUT_CLASS} font-mono`}
                />
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setField("department", e.target.value)}
                  placeholder="واحد سازمانی (مثلاً حراست)"
                  disabled={submitting}
                  className={INPUT_CLASS}
                />
                <div className="sm:col-span-2">
                  <select
                    value={form.role}
                    onChange={(e) => setField("role", e.target.value)}
                    disabled={submitting}
                    className={INPUT_CLASS}
                  >
                    {isSuperAdmin && (
                      <>
                        <option value="SUPERADMIN">مدیر ارشد (SUPERADMIN)</option>
                        <option value="ADMIN">ادمین سیستم (ADMIN)</option>
                      </>
                    )}
                    <option value="SUPERVISOR">سرپرست (SUPERVISOR)</option>
                    <option value="USER">پرسنل (USER)</option>
                    <option value="GUEST">میهمان (GUEST)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                  isEditing
                    ? "bg-amber-600 hover:bg-amber-500"
                    : "bg-cyan-600 hover:bg-cyan-500"
                }`}
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting
                  ? "در حال ذخیره..."
                  : isEditing
                    ? "ذخیره تغییرات کاربر"
                    : "ثبت و ایجاد حساب کاربر"}
              </button>
            </form>

            {/* ------------------------ لیست کاربران ---------------------- */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  لیست کاربران فعال ({usersList?.length || 0})
                </h4>
                <button
                  type="button"
                  onClick={refreshUsers}
                  disabled={usersLoading}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw
                    size={12}
                    className={usersLoading ? "animate-spin" : ""}
                  />
                  بازخوانی
                </button>
              </div>

              {usersLoading && (!usersList || usersList.length === 0) ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400">
                  <Loader2 size={22} className="animate-spin text-cyan-500" />
                  <span className="text-xs">در حال بارگذاری کاربران...</span>
                </div>
              ) : !usersList || usersList.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-xs text-slate-400 border border-dashed border-slate-300 dark:border-white/10 rounded-xl">
                  هیچ کاربری ثبت نشده است.
                </div>
              ) : (
                <div className="space-y-2">
                  {usersList.map((u) => {
                    const badge = ROLE_BADGES[u.role] || ROLE_BADGES.USER;
                    const isSelf = u.id === currentUser?.id;
                    const canDelete =
                      isSuperAdmin && !isSelf && u.username !== "admin";

                    return (
                      <div
                        key={u.id}
                        className={`flex items-center justify-between gap-2 p-3 rounded-xl border transition-colors ${
                          form.id === u.id
                            ? "bg-amber-500/5 border-amber-400/40"
                            : "bg-slate-100/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 shrink-0 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs uppercase">
                            {u.fullName?.charAt(0) || u.username?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold truncate">
                                {u.fullName}
                              </span>
                              <span
                                className="text-[10px] text-slate-400 font-mono"
                                dir="ltr"
                              >
                                @{u.username}
                              </span>
                              {isSelf && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold">
                                  شما
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                              <span className="truncate">
                                {u.department || "عمومی"}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded border text-[9px] font-semibold shrink-0 ${badge.color}`}
                              >
                                {badge.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenAppAccess(u)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-white/10 hover:border-cyan-500/30 text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
                            title="تنظیم دسترسی سامانه‌ها"
                          >
                            <Layers size={13} className="text-cyan-500" />
                            <span className="hidden sm:inline">سامانه‌ها</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => startEdit(u)}
                            className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-colors cursor-pointer"
                            title="ویرایش کاربر"
                          >
                            <UserCog size={15} />
                          </button>

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => askDelete(u.id, u.fullName)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer"
                              title="حذف کاربر"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ------------------ پنل تخصیص دسترسی سامانه‌ها ----------------- */}
          {selectedUserForApps && (
            <div className="absolute inset-0 z-20 bg-white dark:bg-slate-900 p-5 md:p-6 flex flex-col justify-between rounded-3xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3 mb-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 shrink-0 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                      <Layers size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        مدیریت دسترسی به سامانه‌ها
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        کاربر:{" "}
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">
                          {selectedUserForApps.fullName}
                        </span>{" "}
                        ({selectedUserForApps.username})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUserForApps(null);
                      setUserApps([]);
                      setAppsError(null);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    aria-label="بستن"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="relative flex-1">
                    <Search
                      size={13}
                      className="absolute right-3 top-2.5 text-slate-400"
                    />
                    <input
                      type="text"
                      value={appSearchTerm}
                      onChange={(e) => setAppSearchTerm(e.target.value)}
                      placeholder="جستجوی سامانه..."
                      disabled={loadingApps || !!appsError}
                      className="w-full pr-8 pl-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 outline-none focus:border-cyan-500 text-slate-800 dark:text-white placeholder-slate-400 disabled:opacity-50"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <button
                      type="button"
                      disabled={loadingApps || !!appsError}
                      onClick={() => handleSelectAllApps(true)}
                      className="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      انتخاب همه
                    </button>
                    <button
                      type="button"
                      disabled={loadingApps || !!appsError}
                      onClick={() => handleSelectAllApps(false)}
                      className="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      حذف همه
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                  {loadingApps ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-400">
                      <Loader2 size={24} className="animate-spin text-cyan-500" />
                      <span className="text-xs">
                        در حال بارگذاری سامانه‌ها...
                      </span>
                    </div>
                  ) : appsError ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-center px-6">
                      <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
                        <AlertTriangle size={22} />
                      </div>
                      <p className="text-xs font-semibold text-rose-500">
                        {appsError}
                      </p>
                      <button
                        type="button"
                        onClick={() => loadUserApps(selectedUserForApps)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-600 transition-colors cursor-pointer"
                      >
                        <RefreshCw size={12} />
                        تلاش مجدد
                      </button>
                    </div>
                  ) : filteredApps.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-slate-400 text-xs">
                      {appSearchTerm
                        ? `سامانه‌ای با عنوان «${appSearchTerm}» یافت نشد.`
                        : "هیچ سامانه‌ای تعریف نشده است."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-2">
                      {filteredApps.map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => handleToggleApp(app.id)}
                          aria-pressed={!!app.hasAccess}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-right transition-all cursor-pointer select-none ${
                            app.hasAccess
                              ? "bg-cyan-500/5 dark:bg-cyan-500/10 border-cyan-500/40 text-slate-900 dark:text-white shadow-xs"
                              : "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-colors ${
                              app.hasAccess
                                ? "bg-cyan-600 border-cyan-600 text-white"
                                : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                            }`}
                          >
                            {app.hasAccess && <Check size={11} strokeWidth={3} />}
                          </span>

                          <span className="flex items-center gap-2 flex-1 min-w-0">
                            <span
                              className={`p-1.5 rounded-lg shrink-0 ${
                                app.hasAccess
                                  ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                                  : "bg-slate-200 dark:bg-white/5 text-slate-400"
                              }`}
                            >
                              <AppWindow size={14} />
                            </span>
                            <span className="flex flex-col min-w-0">
                              <span className="text-xs font-bold truncate">
                                {app.titleFa || app.title}
                              </span>
                              {app.desc && (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                  {app.desc}
                                </span>
                              )}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* فوتر */}
              <div className="flex items-center justify-between gap-3 border-t border-slate-200 dark:border-white/10 pt-3 mt-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-cyan-500" />
                  سامانه‌های مجاز:{" "}
                  <strong className="text-cyan-600 dark:text-cyan-400">
                    {allowedCount}
                  </strong>{" "}
                  از {userApps.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUserForApps(null);
                      setUserApps([]);
                      setAppsError(null);
                    }}
                    className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    disabled={savingApps || loadingApps || !!appsError}
                    onClick={handleSaveAppAccess}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    {savingApps ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Check size={13} />
                    )}
                    {savingApps ? "در حال ذخیره..." : "ذخیره تغییرات دسترسی"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
