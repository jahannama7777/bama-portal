'use client';

import { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Edit3, 
  Trash2, 
  UtensilsCrossed, 
  Coffee,
  Home, 
  Palmtree,
  CalendarDays, 
  Clock,
  Sparkles, 
  ShieldAlert, 
  ShieldCheck,
  Info, 
  Bus, 
  Car,
  CreditCard, 
  Banknote,
  Stethoscope, 
  HeartPulse,
  Dumbbell, 
  HardHat, 
  Pickaxe, 
  Wrench, 
  Wifi, 
  Laptop, 
  PartyPopper, 
  Gift
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useNotifications } from '@/src/context/NotificationContext';
import NotificationEditModal from './NotificationEditModal';

export default function NotificationWidget() {
  const { isAdmin, isSuperAdmin } = useAuth();
  const { notifications, addNotification, updateNotification, deleteNotification } = useNotifications();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const canManage = isSuperAdmin || isAdmin;

  // نگاشت آیکون‌ها بر اساس نوع
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

  // رنگ‌بندی برچسب‌ها
  const getBadgeClass = (color) => {
    switch (color) {
      case 'amber': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'emerald': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'purple': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'rose': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'cyan': return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      case 'indigo': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      case 'teal': return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
      case 'pink': return 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20';
      case 'violet': return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20';
      default: return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = (itemData) => {
    if (editingItem) {
      updateNotification(editingItem.id, itemData);
    } else {
      addNotification(itemData);
    }
  };

  const handleDelete = (id) => {
    if (confirm('آیا از حذف این اعلان اطمینان دارید؟')) {
      deleteNotification(id);
    }
  };

  return (
    <>
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col h-full">
        {/* هدر ویجت */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/5 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <Bell size={16} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">اعلانات و پیام‌های مهم</h3>
              <p className="text-[10px] text-slate-400">اطلاعیه‌های سیستمی، رفاهی و اداری</p>
            </div>
          </div>

          {canManage && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 transition-all shadow-sm active:scale-95"
            >
              <Plus size={13} />
              <span>افزودن</span>
            </button>
          )}
        </div>

        {/* لیست اعلانات */}
        <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 custom-scrollbar">
          {(!notifications || notifications.length === 0) ? (
            <div className="text-center py-10 text-xs text-slate-400">
              اعلانی برای نمایش ثبت نشده است.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className="group relative p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15 transition-all"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className="mt-0.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm shrink-0">
                      {getIcon(item.type)}
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getBadgeClass(item.badgeColor)}`}>
                            {item.badge}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 mr-auto">
                          {item.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors"
                        title="ویرایش اعلان"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="حذف اعلان"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* مدال افزودن / ویرایش */}
      <NotificationEditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editData={editingItem}
      />
    </>
  );
}
