import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function authorized(request: NextRequest) {
  return isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

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
    ];
    if (!id || !allowed.includes(status))
      return NextResponse.json(
        { error: "Invalid order update." },
        { status: 400 },
      );
    const { error } = await getSupabaseAdmin()
      .from("orders")
      .update({ status })
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to update order." },
      { status: 500 },
    );
  }
}
