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
      .select("id, order_number, user_id, product_name, product_code, size, quantity, unit_price, full_name, contact_number, destination, address")
      .eq("id", id)
      .maybeSingle();
    if (findError) throw findError;
    if (!currentOrder) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const { data: previousOrder } = await supabase
      .from("orders")
      .select("status")
      .eq("id", id)
      .single();
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);
    if (error) throw error;
    let emailSent = false;
    let emailError = "";
    if (status === "confirmed" && previousOrder?.status !== "confirmed") {
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
          const total = `₱${(Number(currentOrder.unit_price) * Number(currentOrder.quantity)).toFixed(2)}`;
          const details = `<div style="margin:24px 0;padding:20px;background:#f5f2ed;border:1px solid #e3ddd4;font-family:Arial,sans-serif;color:#2d2926"><p style="margin:0 0 10px"><strong>Order:</strong> ${escapeHtml(currentOrder.order_number)}</p><p style="margin:0 0 10px"><strong>Item:</strong> ${escapeHtml(currentOrder.product_name)} (${escapeHtml(currentOrder.product_code)})</p><p style="margin:0 0 10px"><strong>Size / quantity:</strong> ${escapeHtml(currentOrder.size)} / ${currentOrder.quantity}</p><p style="margin:0"><strong>Total:</strong> ${total}</p></div>`;
          await transporter.sendMail({ from, to: customerEmail, replyTo: process.env.STORE_EMAIL ?? smtpUser, subject: `Your Above Apprl order ${currentOrder.order_number} is confirmed`, html: `<div style="max-width:600px;margin:auto;padding:32px;background:#faf8f4;font-family:Arial,sans-serif;color:#2d2926"><p style="font-size:11px;letter-spacing:3px;color:#8c806d">ABOVE APPRL</p><h1 style="font-size:28px;margin:22px 0 12px">Your order is confirmed.</h1><p style="font-size:15px;line-height:1.7;color:#665f58">Hi ${escapeHtml(currentOrder.full_name)}, your order has been confirmed and is now being prepared. We’ll keep you updated as it moves through delivery.</p>${details}<p style="font-size:12px;line-height:1.6;color:#8c806d">Thank you for shopping with Above Apprl.</p></div>` });
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
