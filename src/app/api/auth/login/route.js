import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import crypto from 'crypto';

function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password + 'BAMA_SECRET_KEY')
    .digest('hex');
}

export async function POST(req) {
  try {
    const body = await req.json();
    const username = body?.username?.trim();
    const password = body?.password?.trim();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'نام کاربری و کلمه عبور الزامی است.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'کاربری با این مشخصات یافت نشد.' },
        { status: 401 }
      );
    }

    const hashedInput = hashPassword(password);

    // بررسی هم با هش‌شده و هم متن ساده (جهت سهولت توسعه)
    const isMatch = (user.password === hashedInput) || (user.password === password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'کلمه عبور وارد شده اشتباه است.' },
        { status: 401 }
      );
    }

    // حذف پسورد از خروجی امن
    const { password: _, ...safeUser } = user;

    const res = NextResponse.json({
      success: true,
      user: safeUser
    });

    // ست کردن کوکی استاندارد جهت اعتبارسنجی
    res.cookies.set('bama_auth_session', JSON.stringify(safeUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // ۷ روز
    });

    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'خطای سرور در فرایند ورود.' },
      { status: 500 }
    );
  }
}
