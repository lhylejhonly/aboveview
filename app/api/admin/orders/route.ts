import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

function authorized(request: NextRequest) {
  return isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const status = request.nextUrl.searchParams.get('status');
  const supabase = getSupabaseAdmin();
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Unable to load orders.' }, { status: 500 });
  return NextResponse.json({ orders: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const { id, status } = await request.json();
    const allowed = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
    if (!id || !allowed.includes(status)) return NextResponse.json({ error: 'Invalid order update.' }, { status: 400 });
    const { error } = await getSupabaseAdmin().from('orders').update({ status }).eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to update order.' }, { status: 500 });
  }
}
