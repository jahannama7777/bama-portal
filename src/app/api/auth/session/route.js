import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const sessionCookie = req.cookies.get('bama_auth_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ user: null });
    }

    const user = JSON.parse(sessionCookie.value);
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}
