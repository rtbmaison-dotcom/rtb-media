import Stripe from "stripe"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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
    console.error("❌ Invalid Stripe signature:", err.message)
    return new NextResponse("Invalid signature", { status: 400 })
  }

  const data = event.data.object

  // ----------- PAYMENT SUCCESS -----------
  if (event.type === "checkout.session.completed") {
    const email =
      data.customer_details?.email ||
      data.customer_email ||
      data.metadata?.email

    if (!email) {
      console.error("❌ Missing email in session")
      return NextResponse.json({ error: "Missing email" }, { status: 400 })
    }

    console.log("🔍 Looking up profile for:", email)

    // Get the matching profile by email
    const { data: profile, error: lookupErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.toLowerCase())
      .single()

    if (lookupErr || !profile) {
      console.error("❌ No Supabase profile found for:", email)
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Update subscription
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({
        is_subscribed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id)

    if (updateErr) {
      console.error("❌ Supabase update failed:", updateErr.message)
      return NextResponse.json(
        { error: "Supabase update failed" },
        { status: 500 }
      )
    }

    console.log("✅ Subscription activated for:", email)
  }

  // ----------- SUBSCRIPTION ENDED -----------
  if (event.type === "customer.subscription.deleted") {
    const customer = await stripe.customers.retrieve(data.customer)
    const email = customer.email

    if (!email) return NextResponse.json({ received: true })

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.toLowerCase())
      .single()

    if (profile) {
      await supabase
        .from("profiles")
        .update({
          is_subscribed: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)
    }

    console.log("❌ Subscription cancelled:", email)
  }

  return NextResponse.json({ received: true })
}
