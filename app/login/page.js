"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/14A6oIb8Z9C20LW63b3VC00"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState("login") // login | signup | reset
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  // ✅ LOGIN
  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

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

    // ✅ Check payment status from Supabase
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_paid")
      .eq("id", user.id)
      .single()

    if (profileError) {
      setError("Unable to verify subscription status")
      setLoading(false)
      return
    }

    if (profile?.is_paid === true) {
      // ✅ Paid user → allow access
      router.push("/browse")
    } else {
      // ❌ Not paid → send to Stripe
      window.location.href = STRIPE_PAYMENT_LINK
    }
  }

  // ✅ FORGOT PASSWORD
  async function handleForgotPassword(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://richerthanbefore.com/reset-password",
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage("Password reset link sent. Check your email 📬")
    }

    setLoading(false)
  }

  // ✅ SIGN UP → STRIPE PAYMENT LINK
  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (!data?.user) {
      setError("User creation failed")
      setLoading(false)
      return
    }

    // OPTIONAL: create a profile row now (if not created elsewhere)
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email: data.user.email,
      is_paid: false,
    })

    // ✅ Send new user to Stripe
    window.location.href = STRIPE_PAYMENT_LINK
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-black text-white px-6">
      <div className="bg-[#111] p-10 rounded-2xl w-full max-w-md border border-gray-800 shadow-2xl">

        <h1 className="text-3xl font-bold text-center mb-6">
          {mode === "login"
            ? "Sign In"
            : mode === "signup"
            ? "Create Account"
            : "Reset Password"}
        </h1>

        <form
          onSubmit={
            mode === "login"
              ? handleLogin
              : mode === "signup"
              ? handleSignup
              : handleForgotPassword
          }
          className="flex flex-col space-y-4"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded bg-gray-900 border border-gray-700"
          />

          {mode !== "reset" && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 rounded bg-gray-900 border border-gray-700"
            />
          )}

          {mode === "signup" && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="p-3 rounded bg-gray-900 border border-gray-700"
            />
          )}

          {mode === "login" && (
            <p
              onClick={() => setMode("reset")}
              className="text-sm text-gray-400 hover:text-white text-right cursor-pointer"
            >
              Forgot password?
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="py-3 bg-red-600 rounded-xl font-bold disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : mode === "signup"
              ? "Sign Up & Pay"
              : "Send Reset Link"}
          </button>
        </form>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        {message && <p className="text-green-500 mt-4 text-center">{message}</p>}

        {mode !== "reset" && (
          <p
            className="mt-6 text-center text-gray-400 cursor-pointer"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login"
              ? "Need an account? Sign up"
              : "Already have an account? Login"}
          </p>
        )}

        {mode === "reset" && (
          <p
            onClick={() => setMode("login")}
            className="mt-6 text-center text-gray-400 cursor-pointer"
          >
            Back to login
          </p>
        )}
      </div>
    </main>
  )
}
