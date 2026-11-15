import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

function authorized(request: NextRequest) {
  return isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char);

async function notifyUsersOfPromo(code: string, discountPercent: number, expiresAt: string | null) {
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPassword = process.env.SMTP_PASSWORD?.trim().replace(/\s+/g, '');
  if (!smtpHost || !smtpUser || !smtpPassword) return { sent: false, recipientCount: 0, error: 'SMTP email is not configured.' };

  const admin = getSupabaseAdmin();
  const emails: string[] = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    for (const user of data.users) if (user.email && user.email_confirmed_at) emails.push(user.email);
    if (data.users.length < 1000) break;
  }
  if (!emails.length) return { sent: true, recipientCount: 0 };

  const transporter = nodemailer.createTransport({ host: smtpHost, port: Number(process.env.SMTP_PORT ?? 587), secure: process.env.SMTP_SECURE === 'true', auth: { user: smtpUser, pass: smtpPassword } });
  const safeCode = escapeHtml(code);
  const expiryText = expiresAt ? `Offer ends ${new Date(expiresAt).toLocaleDateString('en-PH', { dateStyle: 'long' })}.` : 'Available while the promotion is active.';
  const html = `<div style="margin:0;padding:32px 12px;background:#e9e5df;font-family:Arial,Helvetica,sans-serif;color:#2d2926"><div style="max-width:620px;margin:0 auto;background:#fbfaf7;border:1px solid #d9d1c7"><div style="padding:30px 34px;background:#2d2926;color:#f7f4ee;text-align:center"><div style="font-size:21px;line-height:1;letter-spacing:5px;font-weight:900">ABOVE</div><div style="margin-top:10px;font-size:9px;letter-spacing:3px;color:#c8b79e">APPRL / EVERYDAY ASCENT</div></div><div style="padding:36px 34px 30px;text-align:center"><div style="display:inline-block;padding:7px 11px;background:#fff0d7;color:#8c6b2e;font-size:10px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase">New promotion</div><h1 style="margin:18px 0 10px;font-size:29px;line-height:1.15">A little something for you.</h1><p style="margin:0;font-size:15px;line-height:1.7;color:#665f58">Enjoy ${Number(discountPercent)}% off your next Above Apprl order with this exclusive voucher.</p><div style="margin:28px 0;padding:20px;background:#fff8ec;border:1px solid #d8c6a7"><div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8c806d">Your voucher code</div><div style="margin-top:10px;font-size:26px;font-weight:bold;letter-spacing:3px;color:#6f5735">${safeCode}</div><div style="margin-top:10px;font-size:11px;color:#8c806d">${expiryText}</div></div><p style="margin:0;font-size:12px;line-height:1.7;color:#8c806d">Use the code at checkout. Thank you for being part of the Above Apprl community.</p></div><div style="border-top:1px solid #ded6cc;padding:22px 34px;text-align:center;font-size:10px;letter-spacing:1px;color:#8c806d">ABOVE APPRL · Designed for the everyday ascent.</div></div></div>`;
  const from = process.env.SMTP_FROM ?? smtpUser;
  let recipientCount = 0;
  for (let index = 0; index < emails.length; index += 50) {
    const batch = emails.slice(index, index + 50);
    await transporter.sendMail({ from, to: smtpUser, bcc: batch, subject: `New Above Apprl promotion: ${discountPercent}% off`, html });
    recipientCount += batch.length;
  }
  return { sent: true, recipientCount };
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const { data, error } = await getSupabaseAdmin().from('vouchers').select('id, code, discount_percent, is_active, starts_at, expires_at, usage_limit, used_count').eq('id', 'current').maybeSingle();
  if (error) return NextResponse.json({ error: 'Unable to load voucher settings.' }, { status: 500 });
  return NextResponse.json({ voucher: data });
}

export async function PUT(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const body = await request.json() as { code?: string; discountPercent?: number; isActive?: boolean; startsAt?: string | null; expiresAt?: string | null; usageLimit?: number | null };
    const code = body.code?.trim().toUpperCase();
    const discountPercent = Number(body.discountPercent);
    if (!code || !/^[A-Z0-9][A-Z0-9._-]{1,31}$/.test(code)) return NextResponse.json({ error: 'Use 2-32 letters, numbers, dots, hyphens, or underscores.' }, { status: 400 });
    if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 100) return NextResponse.json({ error: 'Discount must be between 0.01 and 100 percent.' }, { status: 400 });
    const usageLimit = body.usageLimit === null || body.usageLimit === undefined || body.usageLimit === 0 ? null : Number(body.usageLimit);
    if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 1)) return NextResponse.json({ error: 'Maximum uses must be a whole number greater than 0.' }, { status: 400 });
    const startsAt = body.startsAt ? new Date(body.startsAt).toISOString() : null;
    const expiresAt = body.expiresAt ? new Date(body.expiresAt).toISOString() : null;
    if (body.startsAt && Number.isNaN(new Date(body.startsAt).getTime())) return NextResponse.json({ error: 'Start date is invalid.' }, { status: 400 });
    if (body.expiresAt && Number.isNaN(new Date(body.expiresAt).getTime())) return NextResponse.json({ error: 'Expiry date is invalid.' }, { status: 400 });
    if (startsAt && expiresAt && new Date(startsAt).getTime() >= new Date(expiresAt).getTime()) return NextResponse.json({ error: 'Expiry must be after the start date.' }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { data: current } = await supabase.from('vouchers').select('code, discount_percent, is_active, starts_at, expires_at, used_count').eq('id', 'current').maybeSingle();
    const { data, error } = await supabase.from('vouchers').upsert({ id: 'current', code, discount_percent: discountPercent, is_active: body.isActive !== false, starts_at: startsAt, expires_at: expiresAt, usage_limit: usageLimit, used_count: current?.code === code ? current.used_count : 0 }, { onConflict: 'id' }).select('id, code, discount_percent, is_active, starts_at, expires_at, usage_limit, used_count').single();
    if (error) throw error;
    const startsNow = !startsAt || new Date(startsAt).getTime() <= Date.now();
    const shouldNotify = data.is_active && startsNow && (!current?.is_active || current.code !== data.code || Number(current.discount_percent) !== Number(data.discount_percent));
    let notification: { sent: boolean; recipientCount: number; error?: string } | undefined;
    if (shouldNotify) {
      try { notification = await notifyUsersOfPromo(data.code, Number(data.discount_percent), data.expires_at); }
      catch (notificationError) { console.error('Promo notification error', notificationError); notification = { sent: false, recipientCount: 0, error: 'Promo activated, but customer emails could not be sent.' }; }
    }
    return NextResponse.json({ voucher: data, notification });
  } catch (error) {
    console.error('Voucher settings error', error);
    return NextResponse.json({ error: 'Unable to save voucher settings.' }, { status: 500 });
  }
}
