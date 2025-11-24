"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      const { data } = await supabase.auth.getSession()

      if (data?.session?.user) {
        // Send them to Stripe checkout immediately after Google signup
        router.push("/api/checkout_sessions")
      } else {
        router.push("/login")
      }
    }

    handleAuth()
  }, [router]) // ✅ added router here

  return (
    <div className="flex items-center justify-center h-screen text-white bg-black">
      Finishing sign in...
    </div>
  )
}
