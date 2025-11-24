import Stripe from 'stripe'

// Use your Stripe Secret Key (from .env.local in production)
const stripe = new Stripe("sk_test_51S7mvA3XVg28XHhthIDcnWKldrJyy5efcrglWkFBAvokQ01GelaFPHmZXcTOheScCW8eoQaX7f4TQtlj6UNl5EiW00M8V3sLnv")

export async function POST(req) {
  try {
    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: 'price_1S7nJK3XVg28XHhtki2BuWQX', // replace with your real Price ID
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/',
    })

    // Return the session URL to the client
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    console.error('Stripe session creation error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
