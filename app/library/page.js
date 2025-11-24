'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Library() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function checkSubscription() {
      try {
        const res = await fetch('/api/check_subscription')

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`)
        }

        const data = await res.json()
        setIsSubscribed(data.isSubscribed)
      } catch (err) {
        console.error('Subscription check failed:', err)
        setError('Unable to verify subscription')
        setIsSubscribed(false)
      } finally {
        setLoading(false)
      }
    }

    checkSubscription()
  }, [])

  const handleSubscribe = async () => {
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'No checkout URL returned')
      }
    } catch (err) {
      console.error('Checkout failed:', err)
      alert('Unable to start checkout. Please try again.')
    }
  }

  if (loading) {
    return (
      <p className="text-white text-center mt-10">
        Checking subscription...
      </p>
    )
  }

  if (!isSubscribed) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white text-center px-4">
        <h1 className="text-3xl font-bold mb-4">
          Access Denied
        </h1>

        <p className="text-lg mb-6">
          You must subscribe to access the library.
        </p>

        {error && (
          <p className="text-red-400 mb-4">
            {error}
          </p>
        )}

        <button
          onClick={handleSubscribe}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded"
        >
          Subscribe Now
        </button>
      </main>
    )
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-5xl font-bold mb-8">
        RTB Media Library
      </h1>

      <p className="text-xl mb-4">
        ✅ Subscription active. Welcome to the library.
      </p>

      {/* Add your video gallery / player here */}
    </main>
  )
}
