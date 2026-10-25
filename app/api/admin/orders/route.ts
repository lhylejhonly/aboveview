import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function authorized(request: NextRequest) {
  return isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] ?? char);

export async function GET(request: NextRequest) {
  if (!authorized(request))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const status = request.nextUrl.searchParams.get("status");
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error)
    return NextResponse.json(
      { error: "Unable to load orders." },
      { status: 500 },
    );
  const orders = data ?? [];
  const { data: shipments } = orders.length
    ? await supabase
        .from("shipments")
        .select("*")
        .in(
          "order_id",
          orders.map((order) => order.id),
        )
    : { data: [] };
  const shipmentByOrder = new Map(
    (shipments ?? []).map((shipment) => [shipment.order_id, shipment]),
  );
  return NextResponse.json({
    orders: orders.map((order) => ({
      ...order,
      shipment: shipmentByOrder.get(order.id) ?? null,
    })),
  });
}

export async function DELETE(request: NextRequest) {
  if (!authorized(request))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const { id } = await request.json() as { id?: string };
    if (!id) return NextResponse.json({ error: "Order is required." }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { data: order, error: findError } = await supabase
      .from("orders")
      .select("id, status")
      .eq("id", id)
      .maybeSingle();
    if (findError) throw findError;
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    // Cancel first so database triggers restore reserved stock and voucher uses.
    if (order.status !== "cancelled") {
      const { error: cancelError } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", id);
      if (cancelError) throw cancelError;
    }
    const { error: deleteError } = await supabase.from("orders").delete().eq("id", id);
    if (deleteError) throw deleteError;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete order error", error);
    return NextResponse.json({ error: "Unable to delete order." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!authorized(request))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const { id, status } = await request.json();
    const allowed = [
      "pending",
      "confirmed",
      "preparing",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ];
    if (!id || !allowed.includes(status))
      return NextResponse.json(
        { error: "Invalid order update." },
        { status: 400 },
      );
    const supabase = getSupabaseAdmin();
    const { data: currentOrder, error: findError } = await supabase
      .from("orders")
      .select("id, order_number, user_id, status, product_name, product_code, size, quantity, unit_price, full_name, contact_number, destination, address")
      .eq("id", id)
      .maybeSingle();
    if (findError) throw findError;
    if (!currentOrder) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);
    if (error) throw error;
    let emailSent = false;
    let emailError = "";
    if (status !== "pending" && currentOrder.status !== status) {
      const smtpHost = process.env.SMTP_HOST;
      const smtpUser = process.env.SMTP_USER;
      const smtpPassword = process.env.SMTP_PASSWORD;
      if (!smtpHost || !smtpUser || !smtpPassword) {
        emailError = "Email is not configured.";
      } else {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(currentOrder.user_id);
          const customerEmail = userData.user?.email;
          if (!customerEmail) throw new Error("Customer email not found.");
          const transporter = nodemailer.createTransport({ host: smtpHost, port: Number(process.env.SMTP_PORT ?? 587), secure: process.env.SMTP_SECURE === "true", auth: { user: smtpUser, pass: smtpPassword } });
          const from = process.env.SMTP_FROM ?? smtpUser;
          const originalSendMail = transporter.sendMail.bind(transporter);
          if (status !== "confirmed") transporter.sendMail = (async () => ({})) as unknown as typeof transporter.sendMail;
          const total = `₱${(Number(currentOrder.unit_price) * Number(currentOrder.quantity)).toFixed(2)}`;
          const cleanSize = currentOrder.size.replace(/\s*\([^)]*\)/g, '').trim();
          const details = `<div style="margin:24px 0;padding:20px;background:#f5f2ed;border:1px solid #e3ddd4;font-family:Arial,sans-serif;color:#2d2926"><p style="margin:0 0 10px"><strong>Order:</strong> ${escapeHtml(currentOrder.order_number)}</p><p style="margin:0 0 10px"><strong>Item:</strong> ${escapeHtml(currentOrder.product_name)}</p><p style="margin:0 0 10px"><strong>Size / quantity:</strong> ${escapeHtml(cleanSize)} / ${currentOrder.quantity}</p><p style="margin:0"><strong>Total:</strong> ${total}</p></div>`;
          await transporter.sendMail({ from, to: customerEmail, replyTo: process.env.STORE_EMAIL ?? smtpUser, subject: `Your Above Apprl order ${currentOrder.order_number} is confirmed`, html: `<div style="margin:0;padding:32px 12px;background:#e9e5df;font-family:Arial,Helvetica,sans-serif;color:#2d2926"><div style="max-width:620px;margin:0 auto;background:#fbfaf7;border:1px solid #d9d1c7"><div style="padding:30px 34px;background:#2d2926;color:#f7f4ee"><div style="font-size:21px;line-height:1;letter-spacing:5px;font-weight:900">ABOVE</div><div style="margin-top:10px;font-size:9px;letter-spacing:3px;color:#c8b79e">APPRL / EVERYDAY ASCENT</div></div><div style="padding:36px 34px 30px"><div style="display:inline-block;padding:7px 11px;background:#e8efe4;color:#56704b;font-size:10px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase">Order confirmed</div><h1 style="margin:18px 0 10px;font-size:29px;line-height:1.15;color:#2d2926">Your order is confirmed.</h1><p style="margin:0;font-size:15px;line-height:1.7;color:#665f58">Hi ${escapeHtml(currentOrder.full_name)}, your order is now confirmed and being prepared. We’ll keep you updated as it moves through delivery.</p><div style="margin:28px 0;padding:18px 20px;background:#f1ede7;border:1px solid #ded6cc">${details}</div><div style="padding-top:4px;font-size:12px;line-height:1.7;color:#8c806d">Keep your order number <strong style="color:#2d2926">${escapeHtml(currentOrder.order_number)}</strong> for reference. Reply to this email if you need help.</div></div><div style="border-top:1px solid #ded6cc;padding:22px 34px;text-align:center"><div style="font-size:12px;font-weight:900;letter-spacing:3px;color:#2d2926">ABOVE APPRL</div><p style="margin:9px 0 0;font-size:10px;letter-spacing:1px;color:#8c806d">Designed for the everyday ascent.</p></div></div></div>` });
          if (status !== "confirmed") {
            transporter.sendMail = originalSendMail;
            const statusContent: Record<string, { label: string; heading: string; message: string }> = {
              preparing: { label: "Order preparing", heading: "Your order is being prepared.", message: "Our team is now preparing your order for dispatch." },
              shipped: { label: "Order shipped", heading: "Your order is on the way.", message: "Your order has been shipped and is moving through delivery." },
              delivered: { label: "Order delivered", heading: "Your order has been delivered.", message: "We hope you enjoy your new piece from Above Apprl." },
              cancelled: { label: "Order cancelled", heading: "Your order has been cancelled.", message: "Your order has been cancelled. Please contact us if you need assistance." },
              returned: { label: "Order returned", heading: "Your return has been recorded.", message: "We have recorded your returned order and will follow up with the next steps." },
            };
            const content = statusContent[status] ?? { label: "Order updated", heading: "Your order status was updated.", message: "Your Above Apprl order status has changed." };
            await transporter.sendMail({ from, to: customerEmail, replyTo: process.env.STORE_EMAIL ?? smtpUser, subject: `Your Above Apprl order ${currentOrder.order_number}: ${content.label}`, html: `<div style="margin:0;padding:32px 12px;background:#e9e5df;font-family:Arial,Helvetica,sans-serif;color:#2d2926"><div style="max-width:620px;margin:0 auto;background:#fbfaf7;border:1px solid #d9d1c7"><div style="padding:30px 34px;background:#2d2926;color:#f7f4ee"><div style="font-family:'Climate Crisis','Arial Black',Arial,sans-serif;font-size:21px;line-height:1;letter-spacing:5px;font-weight:900">ABOVE</div><div style="margin-top:10px;font-size:9px;letter-spacing:3px;color:#c8b79e">APPRL / EVERYDAY ASCENT</div></div><div style="padding:36px 34px 30px"><div style="display:inline-block;padding:7px 11px;background:#e8efe4;color:#56704b;font-size:10px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase">${content.label}</div><h1 style="margin:18px 0 10px;font-size:29px;line-height:1.15;color:#2d2926">${content.heading}</h1><p style="margin:0;font-size:15px;line-height:1.7;color:#665f58">Hi ${escapeHtml(currentOrder.full_name)}, ${content.message}</p><div style="margin:28px 0;padding:18px 20px;background:#f1ede7;border:1px solid #ded6cc">${details}</div><p style="font-size:12px;line-height:1.7;color:#8c806d">Order reference: <strong style="color:#2d2926">${escapeHtml(currentOrder.order_number)}</strong></p></div><div style="border-top:1px solid #ded6cc;padding:22px 34px;text-align:center"><div style="font-family:'Climate Crisis','Arial Black',Arial,sans-serif;font-size:12px;font-weight:900;letter-spacing:3px;color:#2d2926">ABOVE APPRL</div><p style="margin:9px 0 0;font-size:10px;letter-spacing:1px;color:#8c806d">Designed for the everyday ascent.</p></div></div></div>` });
          }
          emailSent = true;
        } catch (emailFailure) {
          console.error("Order confirmation email error", emailFailure);
          emailError = emailFailure instanceof Error ? emailFailure.message : "Unable to send confirmation email.";
        }
      }
    }
    return NextResponse.json({ ok: true, emailSent, emailError: emailError || undefined });
  } catch (error) {
    console.error("Admin order status update error", error);
    return NextResponse.json(
      { error: "Unable to update order." },
      { status: 500 },
    );
  }
}
