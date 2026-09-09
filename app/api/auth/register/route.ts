import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char);

export async function POST(request: Request) {
  const { email, password } = await request.json() as { email?: string; password?: string };
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPassword = process.env.SMTP_PASSWORD?.replace(/\s+/g, '');
  if (!email || !password || password.length < 6) return NextResponse.json({ error: 'Enter a valid email and a password with at least 6 characters.' }, { status: 400 });
  if (!smtpHost || !smtpUser || !smtpPassword) return NextResponse.json({ error: 'Registration email is not configured yet.' }, { status: 503 });
  if (!smtpHost.includes('.')) return NextResponse.json({ error: 'SMTP_HOST must be a mail server hostname, such as smtp.gmail.com.' }, { status: 503 });
  if (!smtpUser.includes('@')) return NextResponse.json({ error: 'SMTP_USER must be the complete Gmail address, such as aboveapprl@gmail.com.' }, { status: 503 });

  let createdUserId: string | undefined;
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.generateLink({ type: 'signup', email, password, options: { redirectTo: siteUrl } });
    if (error || !data.properties?.action_link) return NextResponse.json({ error: error?.message ?? 'Unable to create the account.' }, { status: 400 });
    createdUserId = data.user?.id;
    const transporter = nodemailer.createTransport({ host: smtpHost, port: Number(process.env.SMTP_PORT ?? 587), secure: process.env.SMTP_SECURE === 'true', auth: { user: smtpUser, pass: smtpPassword }, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 10000 });
    const safeEmail = escapeHtml(email);
    await transporter.sendMail({ from: process.env.SMTP_FROM ?? smtpUser, to: email, subject: 'Confirm your Above Apprl account', html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#2d2926"><p style="font-size:11px;letter-spacing:3px;color:#8c806d;text-transform:uppercase">Above Apprl</p><h1 style="font-size:28px">Confirm your account</h1><p>Confirm <strong>${safeEmail}</strong> to finish creating your customer account and place orders.</p><p style="margin:32px 0"><a href="${data.properties.action_link}" style="background:#2d2926;color:#fff8f0;padding:14px 22px;text-decoration:none;letter-spacing:1px;font-size:12px;text-transform:uppercase">Confirm email</a></p><p style="font-size:12px;color:#777">If you did not create this account, you can ignore this email.</p></div>` });
    return NextResponse.json({ sent: true });
  } catch (caught) {
    console.error('Registration email failed:', caught);
    if (createdUserId) await getSupabaseAdmin().auth.admin.deleteUser(createdUserId);
    const smtpError = caught as { code?: string; responseCode?: number };
    if (smtpError.code === 'EAUTH' || smtpError.responseCode === 535) return NextResponse.json({ error: 'Gmail rejected the SMTP login. Use a Gmail App Password, not your normal Gmail password, and update SMTP_USER and SMTP_PASSWORD in Vercel.' }, { status: 502 });
    if (smtpError.code === 'ETIMEDOUT' || smtpError.code === 'ECONNREFUSED' || smtpError.code === 'ESOCKET') return NextResponse.json({ error: `SMTP connection failed (${smtpError.code}). Verify SMTP_HOST=smtp.gmail.com and SMTP_PORT=587 in Vercel.` }, { status: 502 });
    if (smtpError.code === 'EENVELOPE') return NextResponse.json({ error: 'Gmail rejected the sender address. Set SMTP_FROM to Above Apprl <aboveapprl@gmail.com>.' }, { status: 502 });
    return NextResponse.json({ error: `SMTP email failed (${smtpError.code ?? 'UNKNOWN'}). Verify the Gmail SMTP settings in Vercel.` }, { status: 502 });
  }
}
