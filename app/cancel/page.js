"use client"

import { useRouter } from "next/navigation"

export default function CancelPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full bg-[#0f172a] p-8 rounded-xl border border-white/10 text-center">
        
        <h1 className="text-2xl font-bold mb-4">
          Cancel Subscription
        </h1>

        <p className="text-gray-400 mb-8">
          Are you sure you want to cancel your subscription?  
          You will lose access to all RTB content at the end of your billing period.
        </p>

        <div className="flex gap-4 justify-center">
          {/* GO BACK */}
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            Go Back
          </button>

          {/* CONFIRM CANCEL (TEMP) */}
          <button
            onClick={() => {
              alert("Subscription marked for cancellation (temporary).")
              router.push("/browse")
            }}
            className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition font-semibold"
          >
            Confirm Cancel
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          *This is a temporary page. Billing logic will be connected later.
        </p>

      </div>
    </main>
  )
}
