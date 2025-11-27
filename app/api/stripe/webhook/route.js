import Stripe from "stripe"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
})

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
    return new Response("Invalid signature", { status: 400 })
  }

  try {
    const data = event.data.object

    /* ------------------- PAYMENT SUCCESS ------------------- */
    if (event.type === "checkout.session.completed") {
      const userId = data?.metadata?.userId
      const email =
        data?.customer_details?.email ||
        data?.customer_email ||
        null

      if (!userId && !email) {
        console.error("❌ No userId or email on session")
        return NextResponse.json({ received: true })
      }

      const filters = []
      if (userId) filters.push(`id.eq.${userId}`)
      if (email) filters.push(`email.eq.${email}`)

      const { error } = await supabase
        .from("profiles")
        .update({
          is_subscribed: true,
          updated_at: new Date().toISOString(),
        })
        .or(filters.join(","))

      if (error) {
        console.error("❌ Supabase update error:", error.message)
      } else {
        console.log("✅ Subscription activated for:", userId || email)
      }
    }

    /* ------------------- SUBSCRIPTION CANCELLED ------------------- */
    if (event.type === "customer.subscription.deleted") {
      const customerId = data?.customer

      if (!customerId) {
        console.log("❌ No customer ID on subscription deletion")
        return NextResponse.json({ received: true })
      }

      const customer = await stripe.customers.retrieve(customerId)
      const email = customer?.email

      if (!email) {
        console.log("❌ No email found on customer")
        return NextResponse.json({ received: true })
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          is_subscribed: false,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email)

      if (error) {
        console.error("❌ Supabase update error on cancellation:", error.message)
      } else {
        console.log("❌ Subscription cancelled for:", email)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("❌ Webhook processing error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
