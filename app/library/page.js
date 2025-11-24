'use client'

import { useEffect, useState } from 'react'

export default function Library() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSubscription() {
      try {
        const res = await fetch('/api/check_subscription')
        const data = await res.json()
        setIsSubscribed(data.isSubscribed)
      } catch (err) {
        console.error(err)
        setIsSubscribed(false)
      } finally {
        setLoading(false)
      }
    }
    checkSubscription()
  }, [])

  if (loading) {
    return <p className="text-white text-center mt-10">Loading...</p>
  }

  if (!isSubscribed) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-xl mb-8">You must subscribe to access the library.</p>
        <a
          href="/"
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded"
        >
          Subscribe Now
        </a>
      </main>
    )
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-5xl font-bold mb-8">RTB Media Library</h1>
      <p className="text-xl mb-4">Here is where your premium films will appear.</p>
      {/* TODO: Add your video thumbnails or video player here */}
    </main>
  )
}
