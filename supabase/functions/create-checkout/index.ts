import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Auth
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    if (!user?.email) throw new Error("User not authenticated");

    const { lawyer_id, duration_minutes } = await req.json();
    if (!lawyer_id || ![30, 60].includes(duration_minutes)) {
      throw new Error("Invalid lawyer_id or duration_minutes (must be 30 or 60)");
    }

    // Fetch lawyer
    const { data: lawyer, error: lawyerErr } = await supabaseClient
      .from("lawyers")
      .select("id, hourly_rate, user_id")
      .eq("id", lawyer_id)
      .single();
    if (lawyerErr || !lawyer) throw new Error("Lawyer not found");

    // Prevent self-booking
    if (lawyer.user_id === user.id) throw new Error("Cannot book yourself");

    // Calculate pricing (amounts in paise for INR)
    const baseAmount = duration_minutes === 30
      ? Math.round(lawyer.hourly_rate / 2)
      : lawyer.hourly_rate;
    const platformFee = Math.round(baseAmount * 0.25);
    const totalAmount = baseAmount + platformFee;
    const totalPaise = totalAmount * 100;

    // Fetch lawyer name for checkout description
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("full_name")
      .eq("user_id", lawyer.user_id)
      .single();
    const lawyerName = profile?.full_name || "Lawyer";

    // Init Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find or skip existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    // Create booking record
    const serviceRoleClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: booking, error: bookingErr } = await serviceRoleClient
      .from("bookings")
      .insert({
        user_id: user.id,
        lawyer_id,
        duration_minutes,
        base_amount: baseAmount,
        platform_fee: platformFee,
        total_amount: totalAmount,
        currency: "inr",
        status: "pending",
      })
      .select("id")
      .single();
    if (bookingErr) throw new Error("Failed to create booking: " + bookingErr.message);

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `${duration_minutes}-min Consultation with ${lawyerName}`,
              description: `Legal consultation session (₹${baseAmount} + ₹${platformFee} platform fee)`,
            },
            unit_amount: totalPaise,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/lawyers/${lawyer_id}`,
      metadata: {
        booking_id: booking.id,
        lawyer_id,
        user_id: user.id,
      },
    });

    // Update booking with stripe session id
    await serviceRoleClient
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
