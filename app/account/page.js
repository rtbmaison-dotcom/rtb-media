"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function AccountPage() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [billingLoading, setBillingLoading] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()

        if (error || !data?.user) {
          router.replace("/login")
          return
        }

        setUser(data.user)
      } catch (err) {
        console.error("Profile error:", err)
        router.replace("/login")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleManageBilling = () => {
    setBillingLoading(true)
    router.push("/cancel")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        Loading Account...
      </div>
    )
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-12">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-[#0f172a] p-8 rounded-xl shadow-2xl border border-white/10"
      >

        <h1 className="text-3xl font-bold mb-6">Account</h1>

        <div className="space-y-3 mb-8 text-sm">
          <p className="opacity-80">
            <strong>Email:</strong> {user.email}
          </p>

          <p className="opacity-60 break-all">
            <strong>User ID:</strong> {user.id}
          </p>
        </div>

        <div className="border-t border-white/10 pt-6 space-y-8">

          {/* SUBSCRIPTION */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Subscription</h2>

            <button
              onClick={handleManageBilling}
              disabled={billingLoading}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                billingLoading
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {billingLoading ? "Redirecting..." : "Manage / Cancel Subscription"}
            </button>

            <p className="text-xs opacity-60 mt-2">
              By subscribing you agree that all payments are final and non-refundable.
            </p>
          </div>

          {/* SIGN OUT */}
          <div className="border-t border-white/10 pt-6">
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                router.push("/login")
              }}
              className="text-red-500 hover:underline"
            >
              Sign Out
            </button>
          </div>

        </div>
      </motion.div>

    </main>
  )
}
