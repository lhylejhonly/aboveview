import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char);

export async function POST(request: Request) {
  const { email, password } = await request.json() as { email?: string; password?: string };
  const cleanEnv = (value: string | undefined, key: string) => value?.trim().replace(new RegExp(`^${key}=`, 'i'), '').replace(/^['"]|['"]$/g, '').trim();
  const smtpHost = cleanEnv(process.env.SMTP_HOST, 'SMTP_HOST');
  const smtpUser = cleanEnv(process.env.SMTP_USER, 'SMTP_USER');
  const smtpPassword = cleanEnv(process.env.SMTP_PASSWORD, 'SMTP_PASSWORD')?.replace(/\s+/g, '');
  if (!email || !password || password.length < 6) return NextResponse.json({ error: 'Enter a valid email and a password with at least 6 characters.' }, { status: 400 });
  if (!smtpHost || !smtpUser || !smtpPassword) return NextResponse.json({ error: 'Registration email is not configured yet.' }, { status: 503 });
  if (!smtpHost.includes('.')) return NextResponse.json({ error: 'SMTP_HOST must be a mail server hostname, such as smtp.gmail.com.' }, { status: 503 });
  if (!smtpUser.includes('@')) return NextResponse.json({ error: 'SMTP_USER must be the complete Gmail address, such as aboveapprl@gmail.com.' }, { status: 503 });

  let createdUserId: string | undefined;
  try {
    // Use the actual host receiving the registration request. This prevents
    // confirmation emails from redirecting production users to localhost when
    // a stale NEXT_PUBLIC_SITE_URL value exists in deployment settings.
    const siteUrl = new URL(request.url).origin;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.generateLink({ type: 'signup', email, password, options: { redirectTo: siteUrl } });
    if (error || !data.properties?.action_link) return NextResponse.json({ error: error?.message ?? 'Unable to create the account.' }, { status: 400 });
    createdUserId = data.user?.id;
    const transporter = nodemailer.createTransport({ host: smtpHost, port: Number(process.env.SMTP_PORT ?? 587), secure: process.env.SMTP_SECURE === 'true', auth: { user: smtpUser, pass: smtpPassword }, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 10000 });
    const safeEmail = escapeHtml(email);
    const emailHtml = `<!doctype html><html><body style="margin:0;background:#eeeae4;font-family:Arial,Helvetica,sans-serif;color:#2d2926"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eeeae4;padding:32px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#f8f5ef;border:1px solid #d8d0c6"><tr><td style="background:#2d2926;padding:30px 36px;text-align:center"><div style="font-family:'Climate Crisis','Arial Black',Arial,sans-serif;font-size:17px;line-height:1.1;letter-spacing:5px;font-weight:900;color:#d4b483">ABOVE APPRL</div><div style="margin-top:12px;font-size:10px;letter-spacing:3px;color:#aaa39a;text-transform:uppercase">RAW ATHLEISURE / EARTH TONES</div></td></tr><tr><td style="padding:44px 42px 38px"><div style="height:3px;width:42px;background:#b85d3d;margin-bottom:24px"></div><h1 style="margin:0 0 14px;font-size:30px;line-height:1.15;font-weight:700;letter-spacing:-.5px">Confirm your account</h1><p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#625b54">Welcome to Above Apprl. Confirm <strong style="color:#2d2926">${safeEmail}</strong> to unlock your customer account and place orders.</p><table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 30px"><tr><td style="background:#2d2926"><a href="${data.properties.action_link}" style="display:inline-block;padding:16px 25px;color:#f8f5ef;text-decoration:none;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Confirm email&nbsp;&nbsp;→</a></td></tr></table><p style="margin:0;font-size:12px;line-height:1.6;color:#8c806d">This link confirms your email and securely returns you to Above Apprl.</p></td></tr><tr><td style="border-top:1px solid #ddd5cb;padding:22px 42px;text-align:center"><p style="margin:0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8c806d">Designed for the everyday ascent</p><p style="margin:10px 0 0;font-size:11px;color:#aaa39a">If you did not create this account, you can safely ignore this email.</p></td></tr></table><p style="margin:16px 0 0;font-size:10px;color:#aaa39a">© ${new Date().getFullYear()} Above Apprl</p></td></tr></table></body></html>`;
    await transporter.sendMail({ from: process.env.SMTP_FROM ?? smtpUser, to: email, subject: 'Confirm your Above Apprl account', html: emailHtml });
    return NextResponse.json({ sent: true });
  } catch (caught) {
    console.error('Registration email failed:', caught);
    if (createdUserId) await getSupabaseAdmin().auth.admin.deleteUser(createdUserId);
    const smtpError = caught as { code?: string; responseCode?: number };
    if (smtpError.code === 'EAUTH' || smtpError.responseCode === 535) return NextResponse.json({ error: 'Gmail rejected the SMTP login. Use a Gmail App Password, not your normal Gmail password, and update SMTP_USER and SMTP_PASSWORD in Vercel.' }, { status: 502 });
    if (smtpError.code === 'EDNS' || smtpError.code === 'ENOTFOUND') return NextResponse.json({ error: 'SMTP DNS lookup failed. Set the Vercel SMTP_HOST value to exactly smtp.gmail.com, without quotes or SMTP_HOST=.' }, { status: 502 });
    if (smtpError.code === 'ETIMEDOUT' || smtpError.code === 'ECONNREFUSED' || smtpError.code === 'ESOCKET') return NextResponse.json({ error: `SMTP connection failed (${smtpError.code}). Verify SMTP_HOST=smtp.gmail.com and SMTP_PORT=587 in Vercel.` }, { status: 502 });
    if (smtpError.code === 'EENVELOPE') return NextResponse.json({ error: 'Gmail rejected the sender address. Set SMTP_FROM to Above Apprl <aboveapprl@gmail.com>.' }, { status: 502 });
    return NextResponse.json({ error: `SMTP email failed (${smtpError.code ?? 'UNKNOWN'}). Verify the Gmail SMTP settings in Vercel.` }, { status: 502 });
  }
}
