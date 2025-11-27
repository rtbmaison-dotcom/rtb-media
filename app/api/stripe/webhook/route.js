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
    console.error("❌ Invalid signature:", err.message)
    return new NextResponse("Invalid signature", { status: 400 })
  }

  try {
    const data = event.data.object

    // ✅ PAYMENT SUCCESS
    if (event.type === "checkout.session.completed") {
      const userId = data?.metadata?.userId

      if (!userId) {
        console.error("❌ Missing userId in metadata")
        return NextResponse.json({ error: "Missing userId" }, { status: 400 })
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          is_subscribed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        console.error("❌ Supabase update error:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      console.log("✅ Subscription activated for:", userId)
    }

    // ✅ SUBSCRIPTION ENDED
    if (event.type === "customer.subscription.deleted") {
      const userId = data?.metadata?.userId

      if (!userId) {
        console.error("❌ Missing userId on cancel")
        return NextResponse.json({ received: true })
      }

      await supabase
        .from("profiles")
        .update({
          is_subscribed: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      console.log("❌ Subscription cancelled for:", userId)
    }

    return NextResponse.json({ received: true })

  } catch (err) {
    console.error("❌ Webhook error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
