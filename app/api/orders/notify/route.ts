import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface OrderNotification {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  contactNumber: string;
  destination: string;
  address: string;
  deliveryNotes?: string;
  productName: string;
  productCode: string;
  size: string;
  quantity: number;
  total: string;
}

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char);

export async function POST(request: Request) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const storeEmail = process.env.STORE_EMAIL;
  if (!smtpHost || !smtpUser || !smtpPassword || !storeEmail) return NextResponse.json({ sent: false, reason: 'Email is not configured.' });

  const order = await request.json() as OrderNotification;
  if (!order.orderNumber || !order.customerEmail || !order.productName || !order.address) return NextResponse.json({ error: 'Incomplete order notification.' }, { status: 400 });

  const transporter = nodemailer.createTransport({ host: smtpHost, port: Number(process.env.SMTP_PORT ?? 587), secure: process.env.SMTP_SECURE === 'true', auth: { user: smtpUser, pass: smtpPassword } });
  const details = `<table style="border-collapse:collapse;width:100%;max-width:560px;font-family:Arial,sans-serif;font-size:14px"><tr><td style="padding:8px 0;color:#777">Order</td><td style="padding:8px 0"><strong>${escapeHtml(order.orderNumber)}</strong></td></tr><tr><td style="padding:8px 0;color:#777">Product</td><td style="padding:8px 0">${escapeHtml(order.productName)} (${escapeHtml(order.productCode)})</td></tr><tr><td style="padding:8px 0;color:#777">Size / quantity</td><td style="padding:8px 0">${escapeHtml(order.size)} / ${order.quantity}</td></tr><tr><td style="padding:8px 0;color:#777">Total</td><td style="padding:8px 0"><strong>${escapeHtml(order.total)}</strong></td></tr><tr><td style="padding:8px 0;color:#777">Customer</td><td style="padding:8px 0">${escapeHtml(order.customerName)} · ${escapeHtml(order.contactNumber)}</td></tr><tr><td style="padding:8px 0;color:#777">Destination</td><td style="padding:8px 0">${escapeHtml(order.destination)}</td></tr><tr><td style="padding:8px 0;color:#777">Address</td><td style="padding:8px 0">${escapeHtml(order.address)}</td></tr>${order.deliveryNotes ? `<tr><td style="padding:8px 0;color:#777">Notes</td><td style="padding:8px 0">${escapeHtml(order.deliveryNotes)}</td></tr>` : ''}</table>`;
  const from = process.env.SMTP_FROM ?? smtpUser;
  const brandFontCss = `<style>div[style*="letter-spacing:5px"],div[style*="letter-spacing:3px"]{font-family:'Climate Crisis','Arial Black',Arial,sans-serif!important}</style>`;
  const customerEmailHtml = `${brandFontCss}<div style="margin:0;padding:32px 12px;background:#e9e5df;font-family:Arial,Helvetica,sans-serif;color:#2d2926"><div style="max-width:620px;margin:0 auto;background:#fbfaf7;border:1px solid #d9d1c7"><div style="padding:30px 34px;background:#2d2926;color:#f7f4ee"><div style="font-family:'Climate Crisis','Arial Black',Arial,sans-serif;font-size:21px;line-height:1;letter-spacing:5px;font-weight:900">ABOVE</div><div style="font-family:'Climate Crisis','Arial Black',Arial,sans-serif;margin-top:10px;font-size:9px;letter-spacing:3px;color:#c8b79e">APPRL / EVERYDAY ASCENT</div></div><div style="padding:36px 34px 30px"><div style="display:inline-block;padding:7px 11px;background:#e8efe4;color:#56704b;font-size:10px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase">Order received</div><h1 style="margin:18px 0 10px;font-size:29px;line-height:1.15;color:#2d2926">Thank you, ${escapeHtml(order.customerName)}.</h1><p style="margin:0;font-size:15px;line-height:1.7;color:#665f58">Your Above Apprl order has been received. We’ll review it and keep you updated about delivery.</p><div style="margin:28px 0;padding:18px 20px;background:#f1ede7;border:1px solid #ded6cc">${details}</div><div style="padding-top:4px;font-size:12px;line-height:1.7;color:#8c806d">Please keep your order number <strong style="color:#2d2926">${escapeHtml(order.orderNumber)}</strong> for reference. You can reply directly to this email if you need help.</div></div><div style="border-top:1px solid #ded6cc;padding:22px 34px;text-align:center"><div style="font-family:'Climate Crisis','Arial Black',Arial,sans-serif;font-size:12px;font-weight:900;letter-spacing:3px;color:#2d2926">ABOVE APPRL</div><p style="margin:9px 0 0;font-size:10px;letter-spacing:1px;color:#8c806d">Designed for the everyday ascent.</p></div></div></div>`;
  await transporter.sendMail({ from, to: storeEmail, replyTo: order.customerEmail, subject: `New Above Apprl order ${order.orderNumber}`, html: `<h2>New order received</h2>${details}` });
  await transporter.sendMail({ from, to: order.customerEmail, subject: `Your Above Apprl order ${order.orderNumber} is received`, html: customerEmailHtml });
  return NextResponse.json({ sent: true });
}
