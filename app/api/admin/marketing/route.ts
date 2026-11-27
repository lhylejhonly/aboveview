import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char);

export async function POST(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json() as { subject?: string; message?: string; link?: string };
    const subject = body.subject?.trim() ?? '';
    const message = body.message?.trim() ?? '';
    const link = body.link?.trim() ?? '';
    if (subject.length < 3 || subject.length > 120) return NextResponse.json({ error: 'Subject must be 3-120 characters.' }, { status: 400 });
    if (message.length < 3 || message.length > 5000) return NextResponse.json({ error: 'Message must be 3-5000 characters.' }, { status: 400 });
    if (link && !/^https?:\/\//i.test(link)) return NextResponse.json({ error: 'Shop link must start with http:// or https://.' }, { status: 400 });

    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPassword = process.env.SMTP_PASSWORD?.trim().replace(/\s+/g, '');
    if (!smtpHost || !smtpUser || !smtpPassword) return NextResponse.json({ error: 'SMTP email is not configured.' }, { status: 503 });

    const admin = getSupabaseAdmin();
    const emails: string[] = [];
    for (let page = 1; ; page += 1) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      for (const user of data.users) if (user.email && user.email_confirmed_at) emails.push(user.email);
      if (data.users.length < 1000) break;
    }
    if (!emails.length) return NextResponse.json({ sent: true, recipientCount: 0 });

    const transporter = nodemailer.createTransport({ host: smtpHost, port: Number(process.env.SMTP_PORT ?? 587), secure: process.env.SMTP_SECURE === 'true', auth: { user: smtpUser, pass: smtpPassword } });
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br />');
    const safeLink = escapeHtml(link);
    const cta = link ? `<p style="margin:28px 0 0;text-align:center"><a href="${safeLink}" style="display:inline-block;padding:15px 24px;background:#2d2926;color:#f7f4ee;text-decoration:none;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Shop the collection &nbsp;→</a></p>` : '';
    const html = `<div style="margin:0;padding:32px 12px;background:#e9e5df;font-family:Arial,Helvetica,sans-serif;color:#2d2926"><div style="max-width:620px;margin:0 auto;background:#fbfaf7;border:1px solid #d9d1c7"><div style="padding:30px 34px;background:#2d2926;color:#f7f4ee;text-align:center"><div style="font-size:21px;line-height:1;letter-spacing:5px;font-weight:900">ABOVE</div><div style="margin-top:10px;font-size:9px;letter-spacing:3px;color:#c8b79e">APPRL / EVERYDAY ASCENT</div></div><div style="padding:36px 34px 30px"><div style="display:inline-block;padding:7px 11px;background:#e8efe4;color:#56704b;font-size:10px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase">New collection</div><h1 style="margin:18px 0 18px;font-size:29px;line-height:1.15">${safeSubject}</h1><p style="margin:0;font-size:15px;line-height:1.8;color:#665f58">${safeMessage}</p>${cta}</div><div style="border-top:1px solid #ded6cc;padding:22px 34px;text-align:center;font-size:10px;letter-spacing:1px;color:#8c806d">ABOVE APPRL · Designed for the everyday ascent.</div></div></div>`;
    const text = `${subject}\n\n${message}${link ? `\n\nShop the collection: ${link}` : ''}`;
    const from = process.env.SMTP_FROM ?? smtpUser;
    let recipientCount = 0;
    for (let index = 0; index < emails.length; index += 50) {
      const batch = emails.slice(index, index + 50);
      await transporter.sendMail({ from, to: smtpUser, bcc: batch, subject, text, html });
      recipientCount += batch.length;
    }
    return NextResponse.json({ sent: true, recipientCount });
  } catch (error) {
    console.error('Marketing email error', error);
    return NextResponse.json({ error: 'Unable to send the collection email.' }, { status: 500 });
  }
}
