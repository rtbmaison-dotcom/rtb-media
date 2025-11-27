"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState("login")
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  async function sendToStripe(userId) {
    const res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })

    const { url } = await res.json()
    window.location.href = url
  }

  // ✅ LOGIN
  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const user = data.user

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_subscribed")
      .eq("id", user.id)
      .single()

    if (profileError) {
      setError("Unable to verify subscription")
      setLoading(false)
      return
    }

    if (profile?.is_subscribed) {
      router.push("/browse")
    } else {
      await sendToStripe(user.id)
    }
  }

  // ✅ SIGN UP
  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error || !data?.user) {
      setError(error?.message || "Signup failed")
      setLoading(false)
      return
    }

    await supabase.from("profiles").insert({
      id: data.user.id,
      email: data.user.email,
      is_subscribed: false,
    })

    await sendToStripe(data.user.id)
  }

  // ✅ RESET
  async function handleForgotPassword(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://richerthanbefore.com/reset-password",
    })

    if (error) setError(error.message)
    else setMessage("Check your email for reset link")

    setLoading(false)
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-black text-white px-6">
      <div className="bg-[#111] p-10 rounded-2xl w-full max-w-md border border-gray-800">

        <h1 className="text-2xl font-bold text-center mb-6">
          {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Reset Password"}
        </h1>

        <form
          onSubmit={
            mode === "login"
              ? handleLogin
              : mode === "signup"
              ? handleSignup
              : handleForgotPassword
          }
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Email"
            className="p-3 rounded bg-gray-900 border border-gray-700 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {mode !== "reset" && (
            <input
              type="password"
              placeholder="Password"
              className="p-3 rounded bg-gray-900 border border-gray-700 w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          {mode === "signup" && (
            <input
              type="password"
              placeholder="Confirm Password"
              className="p-3 rounded bg-gray-900 border border-gray-700 w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}

          <button
            disabled={loading}
            className="py-3 bg-red-600 w-full rounded-xl font-bold"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : mode === "signup" ? "Sign Up & Pay" : "Send Reset Link"}
          </button>
        </form>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {message && <p className="text-green-500 text-center mt-4">{message}</p>}

        {mode === "login" && (
          <p onClick={() => setMode("reset")} className="text-right text-sm text-gray-400 mt-4 cursor-pointer">
            Forgot password?
          </p>
        )}

        <p
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-6 text-center text-gray-400 cursor-pointer"
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
        </p>
      </div>
    </main>
  )
}
