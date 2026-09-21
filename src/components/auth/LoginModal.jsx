'use client';

import React, { useState } from 'react';
import { X, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
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
        if (onLoginSuccess) onLoginSuccess(data.user);
        onClose();
        // پاکسازی فرم
        setUsername('');
        setPassword('');
      } else {
        showToast(data?.message || 'نام کاربری یا رمز عبور اشتباه است.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('خطا در برقراری ارتباط با سرور.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100"
        dir="rtl"
      >
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-400 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">ورود به پرتال باما</h2>
          <p className="text-xs text-slate-400 mt-1">مشخصات کاربری خود را وارد کنید</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">نام کاربری</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: admin"
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 focus:border-amber-500 focus:outline-none text-sm text-slate-100 placeholder-slate-500"
                autoFocus
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">کلمه عبور</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 focus:border-amber-500 focus:outline-none text-sm text-slate-100 placeholder-slate-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-3 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
