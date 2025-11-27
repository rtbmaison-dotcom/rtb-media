"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function ResetPassword() {
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [strength, setStrength] = useState("")
  const [hasSession, setHasSession] = useState(false)

  // ✅ Handle session from BOTH hash and query params
  useEffect(() => {
    const handleSessionFromUrl = async () => {
      const hash = window.location.hash
      const search = window.location.search

      const hashParams = new URLSearchParams(hash.replace("#", ""))
      const searchParams = new URLSearchParams(search)

      const access_token =
        hashParams.get("access_token") || searchParams.get("access_token")

      const refresh_token =
        hashParams.get("refresh_token") || searchParams.get("refresh_token")

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        })

        if (error) {
          setMessage("⚠️ Invalid or expired reset link. Please request a new one.")
        } else {
          setHasSession(true)
        }
      } else {
        setMessage("⚠️ Auth session missing. Please request a new reset link.")
      }
    }

    handleSessionFromUrl()
  }, [])

  // ✅ Password strength meter
  useEffect(() => {
    if (password.length < 6) setStrength("Weak")
    else if (password.match(/[A-Z]/) && password.match(/[0-9]/) && password.match(/[^a-zA-Z0-9]/))
      setStrength("Strong")
    else setStrength("Medium")
  }, [password])

  // ✅ Update password
  const handleReset = async (e) => {
    e.preventDefault()

    if (!hasSession) {
      setMessage("⚠️ No active session. Please request a new reset link.")
      return
    }

    if (password !== confirmPassword) {
      setMessage("❌ Passwords do not match")
      return
    }

    if (password.length < 6) {
      setMessage("❌ Password must be at least 6 characters")
      return
    }

    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("✅ Password updated successfully. Redirecting to login...")
      setTimeout(() => router.push("/login"), 2500)
    }

    setLoading(false)
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-black text-white px-6">
      <form
        onSubmit={handleReset}
        className="bg-[#111] p-10 rounded-2xl w-full max-w-md border border-gray-800"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          Set New Password
        </h1>

        <input
          type="password"
          placeholder="New password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 rounded bg-gray-900 border border-gray-700 w-full mb-3"
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          required
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="p-3 rounded bg-gray-900 border border-gray-700 w-full"
        />

        {/* PASSWORD STRENGTH */}
        {password && (
          <p
            className={`text-sm mt-2 ${
              strength === "Strong"
                ? "text-green-500"
                : strength === "Medium"
                ? "text-yellow-500"
                : "text-red-500"
            }`}
          >
            Strength: {strength}
          </p>
        )}

        <button
          className="mt-6 py-3 bg-red-600 w-full rounded-xl font-bold disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update password"}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm">{message}</p>
        )}

        <p
          onClick={() => router.push("/login")}
          className="mt-6 text-center text-gray-500 cursor-pointer"
        >
          Back to login
        </p>
      </form>
    </main>
  )
}
