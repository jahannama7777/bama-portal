"use client";

import React, { useState } from 'react';
import { X, Lock, User, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/context/ToastContext';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      showToast('لطفاً نام کاربری و رمز عبور را وارد کنید.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await login(cleanUser, cleanPass);
      if (data && data.success) {
        showToast('خوش آمدید! ورود با موفقیت انجام شد.', 'success');
        onLoginSuccess?.(data.user);
        onClose();
        setUsername('');
        setPassword('');
      } else {
        showToast(data?.message || 'نام کاربری یا رمز عبور اشتباه است.', 'error');
      }
    } catch (err) {
      showToast('خطا در ارتباط با سرور.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm bg-slate-900/95 border border-slate-700/50 rounded-3xl p-8 shadow-2xl shadow-black/50 text-slate-100"
        dir="rtl"
      >
        {/* دکمه بستن */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* هدر مودال با آیکون انیمیشنی */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-500 mb-4 shadow-inner animate-bounce hover:animate-none cursor-default">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">ورود به پنل مدیریت</h2>
          <p className="text-xs text-slate-400 mt-2">اطلاعات کاربری خود را وارد نمایید</p>
        </div>

        {/* فرم */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-1">نام کاربری</label>
            <div className="relative group">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="نام کاربری خود را وارد کنید"
                className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all text-sm text-slate-200 placeholder-slate-600"
              />
              <User className="w-4 h-4 text-slate-500 absolute right-4 top-3.5 group-focus-within:text-amber-500 transition-colors" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-1">کلمه عبور</label>
            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all text-sm text-slate-200 placeholder-slate-600"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute right-4 top-3.5 group-focus-within:text-amber-500 transition-colors" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-3.5 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                در حال احراز هویت...
              </>
            ) : (
              'ورود به سیستم'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
