'use client';

import { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  Shield, 
  User, 
  UserMinus,
  CheckCircle2, 
  AlertCircle,
  Users
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';

export default function UserManagementModal({ isOpen, onClose }) {
  const { usersList, addUser, deleteUser, user: currentUser, isSuperAdmin } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [department, setDepartment] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  if (!isOpen) return null;

  // تابع کمکی برای استایل و برچسب نقش‌ها
  const getRoleBadge = (roleName) => {
    switch (roleName) {
      case 'SUPERADMIN':
        return {
          label: 'مدیر ارشد',
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
        };
      case 'ADMIN':
        return {
          label: 'ادمین سیستم',
          color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
        };
      case 'GUEST':
        return {
          label: 'میهمان',
          color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
        };
      default:
        return {
          label: 'پرسنل',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
        };
    }
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!fullName || !username || !password) {
      setMsg({ type: 'error', text: 'لطفاً نام، نام کاربری و رمز عبور را وارد کنید.' });
      return;
    }

    const res = addUser({
      fullName,
      username,
      password,
      role,
      department: department || 'دفتر مرکزی'
    });

    if (res.success) {
      setMsg({ type: 'success', text: `کاربر «${fullName}» با نقش «${getRoleBadge(role).label}» ایجاد شد.` });
      setFullName('');
      setUsername('');
      setPassword('');
      setDepartment('');
      setRole('USER');
    } else {
      setMsg({ type: 'error', text: res.error });
    }
  };

  const handleDelete = (id, name) => {
    if (confirm(`آیا از حذف دسترسی کاربر «${name}» اطمینان دارید؟`)) {
      const res = deleteUser(id);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl p-5 md:p-6 text-slate-800 dark:text-white max-h-[90vh] flex flex-col"
        dir="rtl"
      >
        {/* دکمه بستن */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          <X size={18} />
        </button>

        {/* هدر مدال */}
        <div className="flex items-center gap-3 mb-5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-inner">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              مدیریت کاربران و سطوح دسترسی
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal">
                نقش شما: {isSuperAdmin ? 'مدیر ارشد' : 'ادمین'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isSuperAdmin 
                ? 'امکان تعریف و مدیریت تمامی رده‌های کاربری (مدیران، پرسنل و میهمانان)' 
                : 'امکان تعریف ادمین دوم، کاربر پرسنل و کاربر میهمان'}
            </p>
          </div>
        </div>

        {/* پیام‌های وضعیت */}
        {msg.text && (
          <div className={`shrink-0 mb-4 p-3 text-xs rounded-xl flex items-center gap-2 font-medium ${
            msg.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400'
          }`}>
            {msg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{msg.text}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-1 space-y-5 custom-scrollbar">
          {/* فرم ایجاد کاربر جدید */}
          <form onSubmit={handleCreateUser} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/5 space-y-3">
            <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5 mb-1">
              <UserPlus size={15} />
              ایجاد دسترسی جدید
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: علی احمدی"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  نام کاربری (کد پرسنلی / شناسه)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="مثال: a.ahmadi"
                  dir="ltr"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 text-slate-800 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  رمز عبور
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز ورود کاربر"
                  dir="ltr"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 text-slate-800 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  واحد سازمانی / سمت
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="مثال: حراست / کارخانه تغلیظ"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  سطح دسترسی (نقش)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 text-slate-800 dark:text-white font-medium"
                >
                  {/* ادمین اصلی فقط می‌تواند سوپرادمین بسازد */}
                  {isSuperAdmin && (
                    <option value="SUPERADMIN">مدیر ارشد (Super Admin) - دسترسی کامل</option>
                  )}
                  <option value="ADMIN">مدیر سیستم (Admin) - ادمین دوم</option>
                  <option value="USER">کاربر عادی (پرسنل سازمان)</option>
                  <option value="GUEST">کاربر میهمان (Guest)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20 active:scale-[0.99]"
            >
              افزودن و فعال‌سازی حساب کاربری
            </button>
          </form>

          {/* لیست کاربران ثبت‌شده */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
              لیست کاربران فعال ({usersList.length} کاربر)
            </h4>
            <div className="space-y-2">
              {usersList.map((u) => {
                const badge = getRoleBadge(u.role);
                // شرط نمایش دکمه حذف:
                // ۱. اکانت اصلی usr-1 حذف نمی‌شود.
                // ۲. خود کاربر نمی‌تواند اکانت خودش را حذف کند.
                // ۳. ادمین دوم نمی‌تواند اکانت با نقش SUPERADMIN را حذف کند.
                const canDelete = 
                  u.id !== 'usr-1' && 
                  u.id !== currentUser?.id && 
                  (isSuperAdmin || u.role !== 'SUPERADMIN');

                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
                        {u.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-white">
                            {u.fullName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                            @{u.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{u.department || 'عمومی'}</span>
                          <span>•</span>
                          <span className={`px-1.5 py-0.5 rounded border text-[9px] font-semibold ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(u.id, u.fullName)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="حذف دسترسی کاربر"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
