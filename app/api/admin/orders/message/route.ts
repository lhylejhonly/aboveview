import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char);

export async function POST(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  if (!smtpHost || !smtpUser || !smtpPassword) return NextResponse.json({ error: 'Email is not configured yet.' }, { status: 503 });
  try {
    const { id, message } = await request.json() as { id?: string; message?: string };
    const cleanMessage = message?.trim();
    if (!id || !cleanMessage) return NextResponse.json({ error: 'Order and message are required.' }, { status: 400 });
    if (cleanMessage.length > 2000) return NextResponse.json({ error: 'Message must be 2,000 characters or fewer.' }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { data: order, error: orderError } = await supabase.from('orders').select('order_number, user_id').eq('id', id).single();
    if (orderError || !order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(order.user_id);
    const customerEmail = userData.user?.email;
    if (userError || !customerEmail) return NextResponse.json({ error: 'Customer email not found.' }, { status: 404 });
    const transporter = nodemailer.createTransport({ host: smtpHost, port: Number(process.env.SMTP_PORT ?? 587), secure: process.env.SMTP_SECURE === 'true', auth: { user: smtpUser, pass: smtpPassword } });
    const from = process.env.SMTP_FROM ?? smtpUser;
    await transporter.sendMail({ from, to: customerEmail, replyTo: process.env.STORE_EMAIL ?? smtpUser, subject: `Message about your Above Apprl order ${order.order_number}`, text: `Message from Above Apprl about order ${order.order_number}:\n\n${cleanMessage}`, html: `<h2>Message from Above Apprl</h2><p>Regarding order <strong>${escapeHtml(order.order_number)}</strong>:</p><p style="white-space:pre-wrap">${escapeHtml(cleanMessage)}</p><p>You can reply directly to this email if you have questions.</p>` });
    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error('Admin customer message error', error);
    return NextResponse.json({ error: 'Unable to send customer message.' }, { status: 500 });
  }
}
