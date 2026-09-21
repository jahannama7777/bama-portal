'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  UserPlus, 
  Trash2, 
  Users,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/context/ToastContext';

export default function UserManagementModal({ isOpen, onClose }) {
  const { usersList, addUser, deleteUser, user: currentUser, isSuperAdmin } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [department, setDepartment] = useState('');

  // مودال تایید حذف سفارشی
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    setMounted(true); 
  }, []);

  if (!isOpen) return null;

  const getRoleBadge = (roleName) => {
    switch (roleName) {
      case 'SUPERADMIN':
        return { label: 'مدیر ارشد', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      case 'ADMIN':
        return { label: 'ادمین سیستم', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' };
      case 'GUEST':
        return { label: 'میهمان', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' };
      default:
        return { label: 'پرسنل', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!fullName || !username || !password) {
      showToast('لطفاً نام، نام کاربری و رمز عبور را وارد کنید', 'error');
      return;
    }

    try {
      const res = await addUser({ fullName, username, password, role, department });
      
      if (res && res.success) {
        showToast(`حساب کاربری ${fullName} با موفقیت ایجاد شد`, 'success');
        setFullName('');
        setUsername('');
        setPassword('');
        setDepartment('');
      } else {
        showToast(res?.error || res?.message || 'خطا در ایجاد کاربر', 'error');
      }
    } catch (err) {
      showToast('خطا در برقراری ارتباط با سرور', 'error');
    }
  };

  const askDelete = (id, name) => {
    setConfirmDelete({ open: true, id, name });
  };

  const handleFinalDelete = async () => {
    try {
      const res = await deleteUser(confirmDelete.id);
      if (res && res.success) {
        showToast(`کاربر «${confirmDelete.name}» با موفقیت حذف شد`, 'success');
      } else {
        showToast(res?.error || res?.message || 'خطا در حذف کاربر', 'error');
      }
    } catch (err) {
      showToast('خطا در حذف کاربر رخ داد', 'error');
    } finally {
      setConfirmDelete({ open: false, id: null, name: '' });
    }
  };

  return (
    <>
      {/* مودال تایید حذف اختصاصی (Portal) */}
      {mounted && confirmDelete.open && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div dir="rtl" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <div className="p-2 rounded-xl bg-rose-500/10"><AlertTriangle size={24} /></div>
              <h4 className="font-bold">حذف حساب کاربری</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              آیا از حذف دسترسی کاربر «{confirmDelete.name}» اطمینان دارید؟
            </p>
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={handleFinalDelete} 
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                بله، حذف شود
              </button>
              <button 
                type="button"
                onClick={() => setConfirmDelete({ open: false, id: null, name: '' })} 
                className="flex-1 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>, 
        document.body
      )}

      {/* مودال اصلی مدیریت کاربران */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
        <div 
          className="relative w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl p-5 md:p-6 text-slate-800 dark:text-white max-h-[90vh] flex flex-col"
          dir="rtl"
        >
          {/* دکمه بستن مودال */}
          <button 
            type="button"
            onClick={onClose} 
            className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* سربرگ */}
          <div className="flex items-center gap-3 mb-5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-inner">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                مدیریت کاربران و سطوح دسترسی
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                تعریف پرسنل جدید و مدیریت دسترسی‌های سیستم باما
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-5 custom-scrollbar">
            {/* فرم ثبت کاربر جدید */}
            <form onSubmit={handleCreateUser} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/5 space-y-3">
              <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5 mb-1">
                <UserPlus size={15} />
                ایجاد دسترسی جدید
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="نام و نام خانوادگی"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 dark:text-white"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="نام کاربری (انگلیسی)"
                  dir="ltr"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 dark:text-white font-mono"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور"
                  dir="ltr"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 dark:text-white font-mono"
                />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="واحد سازمانی (مثلاً حراست)"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 dark:text-white"
                />
                <div className="sm:col-span-2">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 outline-none focus:border-cyan-500 dark:text-white"
                  >
                    {isSuperAdmin && <option value="SUPERADMIN">مدیر ارشد</option>}
                    <option value="ADMIN">ادمین سیستم</option>
                    <option value="USER">پرسنل</option>
                    <option value="GUEST">میهمان</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                ثبت و ایجاد حساب کاربر
              </button>
            </form>

            {/* لیست کاربران */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
                لیست کاربران فعال ({usersList?.length || 0})
              </h4>
              <div className="space-y-2">
                {usersList && usersList.map((u) => {
                  const badge = getRoleBadge(u.role);
                  const canDelete = u.id !== currentUser?.id && u.username !== 'admin';

                  return (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs uppercase">
                          {u.fullName?.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{u.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-mono" dir="ltr">@{u.username}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span>{u.department || 'عمومی'}</span>
                            <span className={`px-1.5 py-0.5 rounded border text-[9px] font-semibold ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => askDelete(u.id, u.fullName)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="حذف کاربر"
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
    </>
  );
}
