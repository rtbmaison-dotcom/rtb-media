import Stripe from "stripe"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs" // IMPORTANT for Stripe

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ✅ Stripe requires the raw body
export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error("❌ Webhook signature failed:", err.message)
    return new NextResponse("Webhook Error: Invalid signature", { status: 400 })
  }

  try {
    const data = event.data.object

    // ---------- ✅ SUBSCRIPTION SUCCESS ----------
    if (event.type === "checkout.session.completed") {
      // Try multiple ways to get email (Stripe isn't consistent)
      const email =
        data.customer_details?.email ||
        data.customer_email ||
        data.metadata?.email

      if (!email) {
        console.error("❌ No email found in Stripe payload")
        return NextResponse.json({ error: "No email found" }, { status: 400 })
      }

      console.log("✅ Payment completed for:", email)

      // ✅ UPSERT will create if missing or update if existing
      const { error: supabaseError } = await supabase
        .from("profiles")
        .upsert({
          email,
          is_subscribed: true,
          is_paid: true,
          updated_at: new Date().toISOString(),
        })

      if (supabaseError) {
        console.error("❌ Supabase error:", supabaseError.message)
        return NextResponse.json(
          { error: "Supabase update failed" },
          { status: 500 }
        )
      }

      console.log("✅ Subscription activated in Supabase")
    }

    // ---------- ✅ SUBSCRIPTION CANCELLED (END OF PERIOD) ----------
    if (event.type === "customer.subscription.deleted") {
      const subscription = data

      const customer = await stripe.customers.retrieve(subscription.customer)
      const email = customer.email

      if (!email) {
        console.error("❌ No email on subscription cancel")
        return NextResponse.json({ received: true })
      }

      console.log("❌ Subscription ended for:", email)

      await supabase
        .from("profiles")
        .update({
          is_subscribed: false,
          is_paid: false,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email)

      console.log("✅ Subscription removed in Supabase")
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("❌ Webhook handler error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
