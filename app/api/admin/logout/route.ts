import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth';

export function POST() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { httpOnly: true, expires: new Date(0), sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
  return response;
}
