// app/success/page.js
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Success() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to browse after 6 seconds
    const timer = setTimeout(() => {
      router.push("/browse")
    }, 6000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white text-center">
      <h1 className="text-4xl font-bold mb-4">🎉 Thank you for subscribing!</h1>
      <p className="text-xl mb-6">You now have access to all our films.</p>
      <p className="text-gray-400">Redirecting you to Browse...</p>
    </main>
  )
}
