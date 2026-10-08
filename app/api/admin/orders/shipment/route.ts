import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey)
    return NextResponse.json(
      { error: "Supabase server credentials are not configured." },
      { status: 503 },
    );
  try {
    const body = (await request.json()) as { orderId?: string };
    if (!body.orderId)
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 },
      );
    const response = await fetch(
      `${supabaseUrl}/functions/v1/create-jnt-shipment`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${serviceRoleKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );
    const payload = await response
      .json()
      .catch(() => ({ error: "Invalid shipment function response." }));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("J&T shipment proxy error", error);
    return NextResponse.json(
      { error: "Unable to contact the shipment service." },
      { status: 502 },
    );
  }
}
