import Stripe from "stripe"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  try {
    const { userId, email } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "No user id" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      customer_email: email, // ✅ LINKS STRIPE TO USER EMAIL

      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],

      success_url: "https://richerthanbefore.com/browse?success=true",
      cancel_url: "https://richerthanbefore.com/login?cancelled=true",

      payment_method_types: ["card"],

      metadata: {
        userId, // ✅ THIS IS WHAT YOUR WEBHOOK MUST USE
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("❌ Stripe checkout error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
