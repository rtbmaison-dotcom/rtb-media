"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function CancelPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // ✅ Use env if provided, fallback to your link
  const stripePortalLink =
    process.env.NEXT_PUBLIC_STRIPE_PORTAL_URL ||
    "https://billing.stripe.com/p/login/14A6oIb8Z9C20LW63b3VC00"

  const handleCancelRedirect = () => {
    try {
      setLoading(true)
      window.open(stripePortalLink, "_blank", "noopener,noreferrer")
    } catch (error) {
      console.error(error)
      alert("There was a problem connecting to the billing portal.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full bg-[#0f172a] p-8 rounded-2xl border border-white/10 text-center shadow-lg">

        <h1 className="text-2xl font-bold mb-4">
          Cancel Subscription
        </h1>

        <p className="text-gray-400 mb-8 leading-relaxed">
          Are you sure you want to cancel your subscription?  
          You will lose access to all RTB content at the end of your current billing period.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          
          {/* GO BACK */}
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            Go Back
          </button>

          {/* CONFIRM CANCEL */}
          <button
            onClick={handleCancelRedirect}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold transition
              ${loading 
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
              }`}
          >
            {loading ? "Redirecting..." : "Confirm & Manage on Stripe"}
          </button>

        </div>

        <p className="text-xs text-gray-500 mt-6">
          You will be securely redirected to Stripe to manage or cancel your subscription.
        </p>

      </div>
    </main>
  )
}
