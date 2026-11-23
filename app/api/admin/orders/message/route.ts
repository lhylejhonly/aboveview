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
    const safeOrderNumber = escapeHtml(order.order_number);
    const safeMessage = escapeHtml(cleanMessage).replace(/\n/g, '<br />');
    const html = `<!doctype html><html><body style="margin:0;padding:0;background:#e9e5df;font-family:Arial,Helvetica,sans-serif;color:#2d2926"><div style="padding:32px 12px"><div style="max-width:620px;margin:0 auto;overflow:hidden;background:#fbfaf7;border:1px solid #d9d1c7;border-radius:14px"><div style="padding:30px 34px;background:#2d2926;color:#f7f4ee"><div style="font-family:Arial Black,Arial,sans-serif;font-size:22px;line-height:1;letter-spacing:6px;font-weight:900">ABOVE</div><div style="margin-top:10px;font-size:9px;letter-spacing:3px;color:#c8b79e">APPRL / EVERYDAY ASCENT</div></div><div style="padding:34px"><div style="display:inline-block;padding:7px 11px;border-radius:999px;background:#e8efe4;color:#56704b;font-size:10px;font-weight:bold;letter-spacing:1.6px;text-transform:uppercase">Message from Above Apprl</div><h1 style="margin:20px 0 8px;font-size:28px;line-height:1.15;color:#2d2926">A note about your order</h1><p style="margin:0;color:#8c806d;font-size:13px;line-height:1.6">Order reference <strong style="color:#2d2926">${safeOrderNumber}</strong></p><div style="margin:26px 0;padding:22px 24px;border-left:4px solid #74784f;border-radius:8px;background:#f1ede7;color:#4c4742;font-size:15px;line-height:1.8">${safeMessage}</div><p style="margin:0;color:#665f58;font-size:13px;line-height:1.7">You can reply directly to this email if you have questions or need help with your order.</p></div><div style="border-top:1px solid #ded6cc;padding:22px 34px;text-align:center"><div style="font-family:Arial Black,Arial,sans-serif;font-size:12px;font-weight:900;letter-spacing:3px;color:#2d2926">ABOVE APPRL</div><p style="margin:9px 0 0;font-size:10px;letter-spacing:1px;color:#8c806d">Designed for the everyday ascent.</p></div></div></div></body></html>`;
    await transporter.sendMail({ from, to: customerEmail, replyTo: process.env.STORE_EMAIL ?? smtpUser, subject: `Message about your Above Apprl order ${order.order_number}`, text: `Message from Above Apprl about order ${order.order_number}:\n\n${cleanMessage}\n\nYou can reply directly to this email if you have questions.`, html });
    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error('Admin customer message error', error);
    return NextResponse.json({ error: 'Unable to send customer message.' }, { status: 500 });
  }
}
