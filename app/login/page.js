"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState("login") // login | signup | reset
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  // ✅ Read ?mode= from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const m = params.get("mode")
    if (["login", "signup", "reset"].includes(m)) {
      setMode(m)
    }
  }, [])

  // 🔐 AUTH STATE LISTENER (THE IMPORTANT PART)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_subscribed")
          .eq("id", session.user.id)
          .single()

        if (profile?.is_subscribed) {
          router.replace("/browse")
        }
        // if not subscribed → Stripe flow handles redirect
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  async function sendToStripe(userId, userEmail) {
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email: userEmail }),
      })

      const { url } = await res.json()
      if (!url) throw new Error("No Stripe URL returned")

      window.location.href = url
    } catch (err) {
      console.error(err)
      setError("Stripe checkout failed. Try again.")
      setLoading(false)
    }
  }

  // ✅ LOGIN
  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
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

    if (profile?.is_subscribed !== true) {
      await sendToStripe(user.id, user.email)
    }

    setLoading(false)
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

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
    })

    if (error || !data?.user) {
      setError(error?.message || "Signup failed")
      setLoading(false)
      return
    }

    await sendToStripe(data.user.id, data.user.email)
  }

  // ✅ RESET PASSWORD
  async function handleForgotPassword(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase(),
      {
        redirectTo: "https://richerthanbefore.com/reset-password",
      }
    )

    if (error) setError(error.message)
    else setMessage("Check your email for the reset link")

    setLoading(false)
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-black text-white px-6">
      <div className="bg-[#111] p-10 rounded-2xl w-full max-w-md border border-gray-800">

        <h1 className="text-2xl font-bold text-center mb-6">
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
            className="py-3 bg-red-600 w-full rounded-xl font-bold disabled:opacity-50"
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

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {message && <p className="text-green-500 text-center mt-4">{message}</p>}

        {mode === "login" && (
          <p
            onClick={() => setMode("reset")}
            className="text-right text-sm text-gray-400 mt-4 cursor-pointer"
          >
            Forgot password?
          </p>
        )}

        <p
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-6 text-center text-gray-400 cursor-pointer"
        >
          {mode === "login"
            ? "Need an account? Sign up"
            : "Already have an account? Login"}
        </p>
      </div>
    </main>
  )
}
