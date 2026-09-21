'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bell, Plus, Edit3, Trash2, UtensilsCrossed, Coffee, Home, Palmtree,
  CalendarDays, Clock, Sparkles, ShieldAlert, ShieldCheck, Info, Bus, 
  Car, CreditCard, Banknote, Stethoscope, HeartPulse, Dumbbell, 
  HardHat, Pickaxe, Wrench, Wifi, Laptop, PartyPopper, Gift,
  AlertTriangle, Building2
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useNotifications } from '@/src/context/NotificationContext';
import { useToast } from '@/src/context/ToastContext';
import NotificationEditModal from './NotificationEditModal';

export default function NotificationWidget() {
  const { user, can } = useAuth();
  const { notifications, addNotification, updateNotification, deleteNotification } = useNotifications();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  useEffect(() => { setMounted(true); }, []);

  const canManage = can.editOwnAnnouncement(user);

  const canModify = (item) => {
    if (can.editAnyAnnouncement(user)) return true;
    return item.createdById === user?.id;
  };

  // تابع باز کردن مودال تایید حذف
  const askDelete = (id) => {
    setConfirmDelete({ open: true, id });
  };

  // تایید نهایی و حذف
  const handleFinalDelete = () => {
    if (confirmDelete.id) {
      deleteNotification(confirmDelete.id);
      showToast('اعلان با موفقیت حذف شد', 'success');
      setConfirmDelete({ open: false, id: null });
    }
  };

  const getIcon = (type) => {
    const iconProps = { size: 16 };
    switch (type) {
      case 'food': return <UtensilsCrossed {...iconProps} className="text-amber-500" />;
      case 'coffee': return <Coffee {...iconProps} className="text-amber-600" />;
      case 'villa': return <Home {...iconProps} className="text-emerald-500" />;
      case 'trip': return <Palmtree {...iconProps} className="text-emerald-600" />;
      case 'bus': return <Bus {...iconProps} className="text-cyan-500" />;
      case 'car': return <Car {...iconProps} className="text-blue-500" />;
      case 'salary': return <Banknote {...iconProps} className="text-emerald-500" />;
      case 'payment': return <CreditCard {...iconProps} className="text-indigo-500" />;
      case 'health': return <Stethoscope {...iconProps} className="text-rose-500" />;
      case 'insurance': return <HeartPulse {...iconProps} className="text-rose-600" />;
      case 'sport': return <Dumbbell {...iconProps} className="text-teal-500" />;
      case 'mine': return <Pickaxe {...iconProps} className="text-amber-600" />;
      case 'hse': return <HardHat {...iconProps} className="text-yellow-500" />;
      case 'maintenance': return <Wrench {...iconProps} className="text-slate-500" />;
      case 'it_system': return <Laptop {...iconProps} className="text-cyan-600" />;
      case 'network': return <Wifi {...iconProps} className="text-blue-500" />;
      case 'update': return <Sparkles {...iconProps} className="text-cyan-500" />;
      case 'shift': return <Clock {...iconProps} className="text-purple-500" />;
      case 'calendar': return <CalendarDays {...iconProps} className="text-purple-600" />;
      case 'security_alert': return <ShieldAlert {...iconProps} className="text-rose-500" />;
      case 'security_check': return <ShieldCheck {...iconProps} className="text-emerald-500" />;
      case 'celebration': return <PartyPopper {...iconProps} className="text-pink-500" />;
      case 'gift': return <Gift {...iconProps} className="text-violet-500" />;
      default: return <Info {...iconProps} className="text-blue-500" />;
    }
  };

  const getBadgeClass = (color) => {
    switch (color) {
      case 'amber': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'emerald': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'purple': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'rose': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case 'cyan': return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20';
      default: return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
  };

  return (
    <>
      {/* مودال تایید حذف سفارشی */}
      {mounted && confirmDelete.open && createPortal(
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div dir="rtl" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <div className="p-2 rounded-xl bg-rose-500/10"><AlertTriangle size={24} /></div>
              <h4 className="font-bold">حذف اعلان</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">آیا از حذف این اعلان اطمینان دارید؟ این عملیات غیرقابل بازگشت است.</p>
            <div className="flex gap-3">
              <button onClick={handleFinalDelete} className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors">بله، حذف شود</button>
              <button onClick={() => setConfirmDelete({ open: false, id: null })} className="flex-1 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors">انصراف</button>
            </div>
          </div>
        </div>, document.body
      )}

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col h-full">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/5 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center"><Bell size={16} /></div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">اعلانات و پیام‌های مهم</h3>
              <p className="text-[10px] text-slate-400">اطلاعیه‌های سیستمی و اداری</p>
            </div>
          </div>
          {canManage && (
            <button onClick={() => { setEditingItem(null); setModalOpen(true); }} className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 transition-all shadow-sm">
              <Plus size={13} /><span>افزودن</span>
            </button>
          )}
        </div>

        <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 custom-scrollbar">
          {(!notifications || notifications.length === 0) ? (
            <div className="text-center py-10 text-xs text-slate-400">اعلانی ثبت نشده است.</div>
          ) : (
            notifications.map((item) => {
              // دریافت دیپارتمان/واحد ارسال‌کننده
              const departmentName = item.department || item.createdByDepartment || item.user?.department;

              return (
                <div key={item.id} className="group relative p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15 transition-all">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className="mt-0.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm shrink-0">{getIcon(item.type)}</div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.title}</span>
                          {item.badge && <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getBadgeClass(item.badgeColor)}`}>{item.badge}</span>}
                          <span className="text-[10px] text-slate-400 mr-auto">{item.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.desc}</p>
                        
                        {/* نمایش واحد ارسال‌کننده زیر توضیحات */}
                        {departmentName && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                            <Building2 size={11} className="text-cyan-500/80" />
                            <span>ارسال از: <strong className="font-semibold text-slate-600 dark:text-slate-400">{departmentName}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                    {canManage && canModify(item) && (
                      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => { setEditingItem(item); setModalOpen(true); }} className="p-1 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors"><Edit3 size={13} /></button>
                        <button onClick={() => askDelete(item.id)} className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <NotificationEditModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={(data) => editingItem ? updateNotification(editingItem.id, data) : addNotification(data)} editData={editingItem} />
    </>
  );
}
