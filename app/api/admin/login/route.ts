import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, createAdminSession, isValidAdminPassword } from '@/lib/admin-auth';
import { consumeRateLimit, requestIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const limit = consumeRateLimit(`admin-login:${requestIp(request)}`, 8, 10 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } });
  try {
    const { password } = await request.json();
    if (typeof password !== 'string' || !isValidAdminPassword(password)) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const response = NextResponse.json({ authenticated: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Unable to sign in.' }, { status: 500 });
  }
}
