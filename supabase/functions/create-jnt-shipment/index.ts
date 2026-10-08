import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type CreateRequest = { orderId?: string };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

Deno.serve(async (request) => {
  if (request.method !== "POST")
    return json({ error: "Method not allowed." }, 405);
  const authHeader = request.headers.get("authorization");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!authHeader || !serviceRoleKey || !supabaseUrl)
    return json({ error: "Function authentication is not configured." }, 503);
  if (authHeader !== `Bearer ${serviceRoleKey}`)
    return json({ error: "Unauthorized." }, 401);

  try {
    const { orderId } = (await request.json()) as CreateRequest;
    if (!orderId) return json({ error: "Order ID is required." }, 400);
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, order_number, full_name, contact_number, address, province, city_municipality, barangay, postal_code, destination, quantity, product_name, product_code, unit_price, package_weight_kg, cod_amount",
      )
      .eq("id", orderId)
      .single();
    if (orderError || !order) return json({ error: "Order not found." }, 404);
    if (
      !order.full_name ||
      !order.contact_number ||
      !order.address ||
      !order.province ||
      !order.city_municipality ||
      !order.barangay ||
      !order.postal_code ||
      !Number(order.package_weight_kg)
    )
      return json(
        { error: "Complete shipping address and package weight are required." },
        400,
      );

    const { data: existing } = await supabase
      .from("shipments")
      .select("id, tracking_number, shipment_status")
      .eq("order_id", order.id)
      .maybeSingle();
    if (existing && existing.shipment_status !== "failed")
      return json(
        {
          error: "A J&T shipment already exists for this order.",
          shipment: existing,
        },
        409,
      );

    const jntApiUrl = Deno.env.get("JNT_API_URL");
    const jntApiKey = Deno.env.get("JNT_API_KEY");
    const jntCustomerCode = Deno.env.get("JNT_CUSTOMER_CODE");
    const jntSecret = Deno.env.get("JNT_SECRET");
    if (!jntApiUrl || !jntApiKey || !jntCustomerCode || !jntSecret)
      return json({ error: "J&T API credentials are not configured." }, 503);

    // J&T request fields, authentication, signature, and response mapping are intentionally not guessed.
    // Add the official J&T adapter here after the account-specific API specification is supplied.
    void order;
    void jntApiUrl;
    void jntApiKey;
    void jntCustomerCode;
    void jntSecret;
    return json(
      {
        error:
          "J&T API request mapping is not configured. Add the official J&T endpoint and field mapping before creating live shipments.",
      },
      501,
    );
  } catch (error) {
    console.error("create-jnt-shipment error", error);
    return json({ error: "Invalid shipment request." }, 400);
  }
});
