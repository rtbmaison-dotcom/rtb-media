"use client"

export default function SubscribeButton() {
  const handleSubscribe = async () => {
    try {
      const res = await fetch("/api/checkout_sessions", { method: "POST" })

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`)
      }

      const data = await res.json()

      if (!data?.url) {
        throw new Error("No Stripe URL returned")
      }

      window.location.href = data.url
    } catch (err) {
      console.error("Stripe error:", err)
      alert("There was a problem starting checkout.")
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
