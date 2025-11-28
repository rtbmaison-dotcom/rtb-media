"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function Browse() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data?.user) {
        router.replace("/login?mode=signup")
        return
      }

      setUser(data.user)
      setLoading(false)
    }

    getUser()
  }, [router])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <motion.div
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-lg tracking-wide"
        >
          Loading your library...
        </motion.div>
      </div>
    )
  }

  if (!user) return null

  const availableNow = [
    {
      title: "EXTRICATE",
      image: "/hoz poster.JPG",
      link: "/watch/extricate",
    },
    {
      title: "Behind The Lens : Extricate",
      image: "BTL.jpg",
      link: "",
    },
  ]

  const comingSoon = [
    { title: "RTB Documentary", image: "/port poster.jpeg" },
    { title: "The City Series", image: "/port poster.jpeg" },
    { title: "Actors Roundtable", image: "/port poster.jpeg" },
  ]

  return (
    <main className="bg-gray-950 text-white min-h-screen">

      {/* HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-[#0b1230]/80 backdrop-blur border-b border-white/5">
        <div className="flex items-center gap-3">
          <img src="/rtb logo.png" className="w-11 h-11 object-contain" />
        </div>

        <div className="flex items-center gap-4">
          <p className="hidden md:block text-sm text-gray-400">
            {user.email}
          </p>

          <button
            onClick={() => router.push("/account")}
            className="px-4 py-2 rounded-md bg-white/5 hover:bg-white/10 transition text-sm"
          >
            Account
          </button>

          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push("/login?mode=signup")
            }}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition text-sm font-medium"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <img
          src="/hoz poster.JPG"
          className="w-full h-full object-cover opacity-60"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent" />

        <div className="absolute bottom-16 left-10 max-w-xl">
          <h2 className="text-5xl font-extrabold tracking-wide">
            EXTRICATE
          </h2>

          <p className="mt-4 text-lg text-gray-300">
            Explore the official short film and exclusive behind-the-scenes episodes.
          </p>

          <button
            onClick={() => router.push("/watch/extricate")}
            className="mt-6 px-7 py-3 rounded-md bg-red-600 hover:bg-red-700 transition font-semibold"
          >
            Continue Watching
          </button>
        </div>
      </section>

      {/* AVAILABLE NOW */}
      <section className="px-8 py-14">
        <h3 className="text-2xl font-semibold mb-6">Available Now</h3>

        <div className="flex gap-6">
          {availableNow.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.06 }}
              onClick={() => router.push(item.link)}
              className="w-[260px] rounded-lg overflow-hidden bg-gray-800 cursor-pointer"
            >
              <img
                src={item.image}
                className="h-[360px] w-full object-cover"
              />

              <div className="p-4">
                <p className="font-semibold">{item.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* COMING SOON */}
      <section className="px-8 pb-20">
        <h3 className="text-2xl font-semibold mb-6 text-gray-300">
          Coming Soon
        </h3>

        <div className="flex gap-6 opacity-80">
          {comingSoon.map((item, i) => (
            <div
              key={i}
              onClick={() => router.push("/login?mode=signup")}
              className="w-[240px] rounded-lg overflow-hidden bg-gray-800 relative cursor-pointer"
            >
              <img
                src={item.image}
                className="h-[320px] w-full object-cover opacity-40"
              />

              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <p className="font-semibold tracking-wide text-center px-3">
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-10 bg-[#0b1230] text-center text-sm text-gray-400">
        Richer Than Before (RTB) International ©️ 2025 - All Rights Reserved.
      </footer>

    </main>
  )
}
