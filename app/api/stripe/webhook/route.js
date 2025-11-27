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
    console.error("Webhook error:", err.message)
    return new NextResponse("Invalid signature", { status: 400 })
  }

  try {
    const session = event.data.object

    if (event.type === "checkout.session.completed") {
      const userId = session.metadata?.userId

      if (!userId) {
        console.error("No userId in metadata")
        return NextResponse.json({ received: true })
      }

      const { error } = await supabase
        .from("profiles")
        .update({ is_subscribed: true })
        .eq("id", userId)

      if (error) {
        console.error(error.message)
        return NextResponse.json({ error: "Supabase update failed" }, { status: 500 })
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const userId = session.metadata?.userId

      if (!userId) return NextResponse.json({ received: true })

      await supabase
        .from("profiles")
        .update({ is_subscribed: false })
        .eq("id", userId)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error(err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
