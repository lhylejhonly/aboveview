import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { consumeRateLimit, requestIp } from '@/lib/rate-limit';

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char);

const env = (value: string | undefined, key: string) => value?.trim().replace(new RegExp(`^${key}=`, 'i'), '').replace(/^['"]|['"]$/g, '').trim();

export async function POST(request: Request) {
  const limit = consumeRateLimit(`magic-link:${requestIp(request)}`, 5, 10 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } });

  const body = await request.json().catch(() => ({})) as { email?: string };
  const email = body.email?.trim().toLowerCase();
  const smtpHost = env(process.env.SMTP_HOST, 'SMTP_HOST');
  const smtpUser = env(process.env.SMTP_USER, 'SMTP_USER');
  const smtpPassword = env(process.env.SMTP_PASSWORD, 'SMTP_PASSWORD')?.replace(/\s+/g, '');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  if (!smtpHost || !smtpUser || !smtpPassword) return NextResponse.json({ error: 'Email delivery is not configured yet.' }, { status: 503 });

  try {
    const admin = getSupabaseAdmin();
    const siteUrl = new URL(request.url).origin;
    let generated = await admin.auth.admin.generateLink({ type: 'magiclink', email, options: { redirectTo: siteUrl } });

    if (generated.error && /not found|user/i.test(generated.error.message)) {
      const created = await admin.auth.admin.createUser({ email, email_confirm: true });
      if (created.error) throw created.error;
      generated = await admin.auth.admin.generateLink({ type: 'magiclink', email, options: { redirectTo: siteUrl } });
    }

    const actionLink = generated.data.properties?.action_link;
    if (generated.error || !actionLink) throw generated.error ?? new Error('Unable to create a magic link.');

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: smtpUser, pass: smtpPassword },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
    const safeEmail = escapeHtml(email);
    const html = `<!doctype html><html><body style="margin:0;background:#e8e3dc;font-family:Arial,Helvetica,sans-serif;color:#24211f"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#e8e3dc;padding:40px 15px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#f7f4ee;border:1px solid #d6cec4"><tr><td style="background:#24211f;padding:42px 30px 38px;text-align:center"><div style="font-size:24px;line-height:1;letter-spacing:7px;font-weight:900;color:#f1e9dc">ABOVE</div><div style="margin-top:14px;font-size:9px;letter-spacing:4px;color:#b9aa97">APPRL / EVERYDAY ASCENT</div></td></tr><tr><td style="padding:38px 42px 42px"><div style="width:45px;height:3px;background:#b85d3d"></div><h1 style="margin:22px 0 16px;font-size:30px;line-height:1.15;color:#24211f">Your secure sign-in link</h1><p style="margin:0 0 22px;font-size:15px;line-height:1.8;color:#665f58">Click below to sign in to your Above Apprl account. No password is needed.</p><div style="margin:25px 0 28px;padding:17px 20px;background:#eee9e1;border:1px solid #d9d0c5"><div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#938779;margin-bottom:7px">Account email</div><div style="font-size:14px;font-weight:bold;color:#24211f;word-break:break-word">${safeEmail}</div></div><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td style="background:#24211f"><a href="${actionLink}" style="display:inline-block;padding:18px 30px;color:#f7f4ee;text-decoration:none;font-size:11px;font-weight:bold;letter-spacing:2.5px;text-transform:uppercase">Continue to Above&nbsp;&nbsp;→</a></td></tr></table><p style="margin:26px 0 0;font-size:11px;line-height:1.6;color:#938779">This secure link expires shortly and can only be used once. If you did not request it, you can safely ignore this email.</p></td></tr><tr><td style="border-top:1px solid #d9d1c7;padding:28px 35px 32px;text-align:center"><div style="font-size:13px;font-weight:900;letter-spacing:4px;color:#24211f">ABOVE APPRL</div><p style="margin:14px 0 0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#938779">Designed for the everyday ascent.</p></td></tr></table></td></tr></table></body></html>`;
    await transporter.sendMail({ from: process.env.SMTP_FROM ?? smtpUser, to: email, subject: 'Your secure Above Apprl sign-in link', html });
    return NextResponse.json({ sent: true });
  } catch (caught) {
    console.error('Magic link email failed:', caught);
    const smtpError = caught as { code?: string };
    return NextResponse.json({ error: `Unable to send the sign-in link (${smtpError.code ?? 'EMAIL_ERROR'}).` }, { status: 502 });
  }
}
