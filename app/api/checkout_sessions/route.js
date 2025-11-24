export const runtime = 'nodejs'

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export async function POST() {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',

      line_items: [
        {
          price: 'price_1SX5lcKU33MgwjrBDfhHbPFV', // ✅ your NEW live price
          quantity: 1,
        },
      ],

      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Stripe error:', err)

    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    )
  }
}
