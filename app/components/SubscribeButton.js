'use client'

export default function SubscribeButton() {
  const handleSubscribe = async () => {
    try {
      const res = await fetch('/api/checkout_sessions', { method: 'POST' })
      const data = await res.json()
      window.location.href = data.url
    } catch (err) {
      console.error('Error creating Stripe session:', err)
      alert('There was an error. Please try again.')
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded"
    >
      Subscribe Now
    </button>
  )
}
