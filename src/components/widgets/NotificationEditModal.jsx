"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Search,
  Check,
  Building2,
  Bell
} from "lucide-react";
import { useToast } from "@/src/context/ToastContext";
import { useAuth } from "@/src/context/AuthContext";
import { NOTIF_ICON_TYPES, portalIcons } from "@/src/data/appData";

const COLOR_OPTIONS = [
  { id: "cyan", name: "فیروزه‌ای", class: "bg-cyan-500" },
  { id: "emerald", name: "سبز", class: "bg-emerald-500" },
  { id: "amber", name: "نارنجی / کهربایی", class: "bg-amber-500" },
  { id: "rose", name: "قرمز / رز", class: "bg-rose-500" },
  { id: "purple", name: "بنفش", class: "bg-purple-500" },
  { id: "indigo", name: "نیلی", class: "bg-indigo-500" },
  { id: "blue", name: "آبی", class: "bg-blue-500" },
  { id: "teal", name: "سبز دریایی", class: "bg-teal-500" },
  { id: "pink", name: "صورتی", class: "bg-pink-500" },
  { id: "violet", name: "یاسی", class: "bg-violet-500" },
  { id: "slate", name: "خاکستری", class: "bg-slate-500" },
];

export default function NotificationEditModal({
  isOpen,
  onClose,
  onSave,
  editData,
}) {
  const { user, can } = useAuth();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPrivileged = ["SUPERADMIN", "ADMIN", "SUPERVISOR"].includes(user?.role);
  const canTargetBroadly = isPrivileged || (can?.sendNotifications ? can.sendNotifications(user) : false);

  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    badge: "اطلاعیه عمومی",
    type: "info",
    badgeColor: "blue",
    department: "",
    targetType: "ALL",
    targetRole: "USER",
    targetDepartment: "",
    targetUserId: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title || "",
        desc: editData.desc || "",
        badge: editData.badge || "اطلاعیه عمومی",
        type: editData.type || "info",
        badgeColor: editData.badgeColor || editData.color || "blue",
        department: editData.department || editData.createdBy?.department || "",
        targetType: editData.targetType || "ALL",
        targetRole: editData.targetRole || "USER",
        targetDepartment: editData.targetDepartment || "",
        targetUserId: editData.targetUserId ? String(editData.targetUserId) : "",
      });
    } else {
      const defaultType = NOTIF_ICON_TYPES.find((t) => t.id === "food") || NOTIF_ICON_TYPES[0];
      setFormData({
        title: "",
        desc: "",
        badge: defaultType?.defaultBadge || "رزرو غذا",
        type: defaultType?.id || "food",
        badgeColor: defaultType?.color || "amber",
        department: user?.department || "",
        targetType: canTargetBroadly ? "ALL" : "DEPARTMENT",
        targetRole: "USER",
        targetDepartment: user?.department || "",
        targetUserId: "",
      });
    }
    setSearchTerm("");
    setIsSubmitting(false);
  }, [editData, isOpen, user, canTargetBroadly]);

  const filteredTypes = useMemo(() => {
    if (!searchTerm.trim()) return NOTIF_ICON_TYPES;
    return NOTIF_ICON_TYPES.filter((item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      item.defaultBadge.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast("لطفاً عنوان اعلان را وارد کنید.", "error");
      return;
    }

    if (!formData.desc.trim()) {
      showToast("لطفاً متن کامل اعلان را وارد کنید.", "error");
      return;
    }

    try {
      const getJalaliDateTime = () => {
        return new Intl.DateTimeFormat("fa-IR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date());
      };

      setIsSubmitting(true);
      const isEditing = Boolean(editData?.id);
      const payload = {
        ...formData,
        department: formData.department.trim() || user?.department || null,
        targetUserId: formData.targetUserId
          ? Number(formData.targetUserId)
          : null,
        targetDepartment:
          formData.targetType === "DEPARTMENT"
            ? formData.targetDepartment.trim() || user?.department || null
            : null,
        targetRole:
          formData.targetType === "ROLE" ? formData.targetRole : null,
        ...(isEditing ? { id: editData.id } : {}),
        date: editData?.date || getJalaliDateTime(),
      };

      if (typeof onSave === "function") {
        await onSave(payload);
      }

      showToast(
        isEditing
          ? "اطلاعیه با موفقیت ویرایش شد"
          : "اطلاعیه جدید با موفقیت ثبت شد",
        "success"
      );

      setIsSubmitting(false);
      onClose();
    } catch (error) {
      setIsSubmitting(false);
      showToast("خطا در ذخیره‌سازی اطلاعات. لطفاً مجدداً تلاش کنید.", "error");
    }
  };

  if (!mounted) return null;

  return (
    <>
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-99999 flex items-center justify-center p-4"
            dir="rtl"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
              onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/50">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">
                    {editData ? "ویرایش اطلاعیه" : "ثبت اعلان و اطلاعیه جدید"}
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    تنظیم محتوا، دسته‌بندی و دپارتمان صادرکننده
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form
                onSubmit={handleSubmit}
                id="notification-form"
                className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5"
              >
                {/* انتخاب نوع اعلان */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      انتخاب آیکون و زمینه ({filteredTypes.length} مورد موجود):
                    </label>

                    <div className="relative w-48 sm:w-56">
                      <Search
                        size={13}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="جستجوی آیکون یا بج..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-8 pl-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1.5 border border-slate-200/80 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40">
                    {filteredTypes.map((item) => {
                      const IconComponent =
                        typeof item.icon === "string"
                          ? portalIcons[item.icon] || portalIcons[item.id] || Bell
                          : item.icon || Bell;

                      const isSelected = formData.type === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              type: item.id,
                              badge: item.defaultBadge || prev.badge,
                              badgeColor: item.color || prev.badgeColor,
                            }));
                          }}
                          className={`flex items-center gap-2 p-2 rounded-xl text-xs text-right border transition-all ${
                            isSelected
                              ? "bg-cyan-500/15 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-bold shadow-sm ring-1 ring-cyan-500/50"
                              : "bg-white dark:bg-slate-800/70 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                          }`}
                        >
                          <div
                            className={`p-1.5 rounded-lg shrink-0 ${
                              isSelected
                                ? "bg-cyan-500 text-white"
                                : "bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-300"
                            }`}
                          >
                            <IconComponent size={14} />
                          </div>
                          <span className="truncate flex-1">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* عنوان و دپارتمان */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      عنوان اعلان <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="مثال: رزرو وعده ناهار..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Building2 size={13} className="text-cyan-500" />
                      واحد / دپارتمان صادرکننده
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      placeholder="مثال: فناوری اطلاعات، امور اداری، HSE..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>

                {/* مخاطب اعلان */}
                <div className="space-y-2.5 p-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/30">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    مخاطب اعلان (Target)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(canTargetBroadly
                      ? ["ALL", "ROLE", "DEPARTMENT", "INDIVIDUAL"]
                      : ["DEPARTMENT", "INDIVIDUAL"]
                    ).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, targetType: t }))
                        }
                        className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                          formData.targetType === t
                            ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-600 dark:text-cyan-400"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-500"
                        }`}
                      >
                        {t === "ALL"
                          ? "همه"
                          : t === "ROLE"
                            ? "نقش"
                            : t === "DEPARTMENT"
                              ? "دپارتمان"
                              : "کاربر"}
                      </button>
                    ))}
                  </div>

                  {formData.targetType === "ROLE" && (
                    <select
                      value={formData.targetRole}
                      onChange={(e) =>
                        setFormData({ ...formData, targetRole: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="USER">پرسنل</option>
                      <option value="SUPERVISOR">سرپرستان</option>
                      <option value="ADMIN">مدیران</option>
                      <option value="GUEST">میهمانان</option>
                    </select>
                  )}

                  {formData.targetType === "DEPARTMENT" && (
                    <input
                      type="text"
                      value={formData.targetDepartment}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetDepartment: e.target.value,
                        })
                      }
                      placeholder="نام دپارتمان مخاطب"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100"
                    />
                  )}

                  {formData.targetType === "INDIVIDUAL" && (
                    <input
                      type="number"
                      value={formData.targetUserId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetUserId: e.target.value,
                        })
                      }
                      placeholder="شناسه کاربر (userId)"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100"
                    />
                  )}
                </div>

                {/* بج و رنگ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      برچسب اعلان (Badge)
                    </label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) =>
                        setFormData({ ...formData, badge: e.target.value })
                      }
                      placeholder="مثال: فوری، اداری، رفاهی..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      رنگ برچسب
                    </label>
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          title={c.name}
                          onClick={() =>
                            setFormData({ ...formData, badgeColor: c.id })
                          }
                          className={`w-7 h-7 rounded-full ${c.class} flex items-center justify-center transition-transform ${
                            formData.badgeColor === c.id
                              ? "scale-110 ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900"
                              : "opacity-70 hover:opacity-100"
                          }`}
                        >
                          {formData.badgeColor === c.id && (
                            <Check
                              size={13}
                              className="text-white drop-shadow"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* متن کامل */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    متن کامل اعلان <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.desc}
                    onChange={(e) =>
                      setFormData({ ...formData, desc: e.target.value })
                    }
                    placeholder="توضیحات کامل اطلاعیه..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                  />
                </div>
              </form>

              {/* Footer */}
              <div className="shrink-0 flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/50">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  form="notification-form"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-white shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
                >
                  {isSubmitting
                    ? "در حال ذخیره..."
                    : editData
                      ? "ذخیره تغییرات"
                      : "افزودن اعلان"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
