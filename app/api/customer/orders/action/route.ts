import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!accessToken) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const { orderId, action } = await request.json() as { orderId?: string; action?: string };
    if (!orderId || !["cancel", "return"].includes(action ?? "")) {
      return NextResponse.json({ error: "Invalid order action." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: { user }, error: userError } = await admin.auth.getUser(accessToken);
    if (userError || !user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("id, user_id, status")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const nextStatus = action === "cancel" ? "cancelled" : "returned";
    if (action === "cancel" && order.status !== "pending") {
      return NextResponse.json({ error: "Only pending orders can be cancelled." }, { status: 400 });
    }
    if (action === "return" && order.status !== "delivered") {
      return NextResponse.json({ error: "Only delivered orders can be returned." }, { status: 400 });
    }

    const { error: updateError } = await admin
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", order.id)
      .eq("user_id", user.id);
    if (updateError) throw updateError;
    return NextResponse.json({ status: nextStatus });
  } catch (error) {
    console.error("Customer order action error", error);
    return NextResponse.json({ error: "Unable to update this order." }, { status: 500 });
  }
}
