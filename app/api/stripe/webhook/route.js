import Stripe from "stripe"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error("❌ Webhook Signature Error:", err.message)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const data = event.data.object

  // ✅ PAYMENT COMPLETE → ACTIVATE ACCESS
  if (event.type === "checkout.session.completed") {
    const email = data.customer_details?.email

    if (!email) {
      console.error("❌ No email found in session")
      return NextResponse.json({ error: "No email found" }, { status: 400 })
    }

    console.log("✅ Payment completed for:", email)

    const { error } = await supabase
      .from("profiles")
      .update({
        is_subscribed: true,
        is_paid: true
      })
      .eq("email", email)

    if (error) {
      console.error("❌ Supabase update error:", error)
      return NextResponse.json({ error: "Supabase update failed" }, { status: 500 })
    }

    console.log("✅ Supabase updated for:", email)
  }

  // ✅ SUBSCRIPTION ENDED (after period finishes)
  if (event.type === "customer.subscription.deleted") {
    const customer = await stripe.customers.retrieve(data.customer)

    const email = customer?.email

    if (!email) {
      console.error("❌ No email found on subscription delete")
      return NextResponse.json({ error: "No email found" }, { status: 400 })
    }

    console.log("❌ Subscription ended for:", email)

    const { error } = await supabase
      .from("profiles")
      .update({
        is_subscribed: false,
        is_paid: false
      })
      .eq("email", email)

    if (error) {
      console.error("❌ Supabase update error on cancel:", error)
      return NextResponse.json({ error: "Supabase cancel failed" }, { status: 500 })
    }

    console.log("✅ Subscription removed in Supabase for:", email)
  }

  return NextResponse.json({ received: true })
}
