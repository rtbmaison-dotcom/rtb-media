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
      mode: "payment",

      // ✅ SHOW PROMO CODE BOX
      allow_promotion_codes: true,

      // ✅ ENABLE PAYPAL (if available in your Stripe region)
      payment_method_types: ["card", "paypal"],

      customer_email: email,

      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],

      success_url: "https://richerthanbefore.com/browse?success=true",
      cancel_url: "https://richerthanbefore.com/login?cancelled=true",

      metadata: {
        userId, // ✅ used by your webhook
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("❌ Stripe checkout error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
