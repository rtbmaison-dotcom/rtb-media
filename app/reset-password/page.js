"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    async function handleSessionFromUrl() {
      const hash = window.location.hash
      const params = new URLSearchParams(hash.replace("#", ""))

      const access_token = params.get("access_token")
      const refresh_token = params.get("refresh_token")

      if (access_token && refresh_token) {
        await supabase.auth.setSession({
          access_token,
          refresh_token,
        })
      }
    }

    handleSessionFromUrl()
  }, [])

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("✅ Password updated successfully")
      setTimeout(() => router.push("/login"), 2000)
    }

    setLoading(false)
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-black text-white">
      <form
        onSubmit={handleReset}
        className="bg-[#111] p-10 rounded-2xl w-full max-w-md border border-gray-800"
      >
        <h1 className="text-2xl font-bold mb-6">Set New Password</h1>

        <input
          type="password"
          placeholder="New password"
          value={password}
          required
          minLength={6}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 rounded bg-gray-900 border border-gray-700 w-full"
        />

        <button
          className="mt-6 py-3 bg-red-600 w-full rounded-xl font-bold"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update password"}
        </button>

        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </main>
  )
}
