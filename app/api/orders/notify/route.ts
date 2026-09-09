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
  await transporter.sendMail({ from, to: storeEmail, replyTo: order.customerEmail, subject: `New Above Apprl order ${order.orderNumber}`, html: `<h2>New order received</h2>${details}` });
  await transporter.sendMail({ from, to: order.customerEmail, subject: `Above Apprl order confirmation ${order.orderNumber}`, html: `<h2>Thank you for your Above Apprl order</h2><p>We received your order and will contact you about delivery.</p>${details}` });
  return NextResponse.json({ sent: true });
}
