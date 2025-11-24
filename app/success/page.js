"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Success() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/browse")
    }, 6000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white text-center px-6">
      <h1 className="text-4xl font-bold mb-4">
        🎉 Thank you for subscribing!
      </h1>

      <p className="text-xl mb-6">
        You now have full access to all content.
      </p>

      <div className="animate-pulse text-gray-400">
        Redirecting you to Browse...
      </div>

      {/* Fallback button in case redirect fails */}
      <button
        onClick={() => router.push("/browse")}
        className="mt-8 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition"
      >
        Go to Browse now →
      </button>
    </main>
  )
}
