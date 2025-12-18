"use client"

import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter, useParams } from "next/navigation"
import MuxPlayer from "@mux/mux-player-react"

export default function WatchPage() {
  const [videoUrl, setVideoUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [startTime, setStartTime] = useState(0)

  const router = useRouter()
  const params = useParams()
  const slug = params?.slug

  const saveInFlight = useRef(false)
  const lastSavedAt = useRef(0)
  const currentUserId = useRef(null)

  // ✅ Your films
 const videos = {
  extricate: {
    title: "EXTRICATE",
    playbackId: "JLwA44ZH1v4RcpBDosEILpyQc8wKx01Ayjm7wB02gzzC00",
    poster: "/port-poster.jpeg",
  },
  "behind-the-lens": {
    title: "Behind The Lens : Extricate",
    playbackId: "UP5ldSu1IHBFp01cB3vOFOiy01IAgi02ui1pccxt01KiCM00",
    poster: "/BTL.jpg",
  },
}


  const film = videos[slug]

  useEffect(() => {
    async function load() {
      try {
        if (!film) {
          router.replace("/browse")
          return
        }

        // 1) Auth check
        const { data, error: authError } = await supabase.auth.getUser()
        if (authError || !data?.user) {
          router.replace("/login")
          return
        }
        const user = data.user
        currentUserId.current = user.id

        // 2) Subscription check from profiles table
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_subscribed")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.warn("Profile lookup error:", profileError.message)
        } else if (!profile?.is_subscribed) {
          // user not subscribed – send them to your paywall/subscribe page
          router.replace("/library") // or "/subscribe" or "/pricing"
          return
        }

        // 3) Fetch existing watch progress (if any)
        const { data: progress, error: progressError } = await supabase
          .from("watch_progress")
          .select("position_seconds")
          .eq("user_id", user.id)
          .eq("slug", slug)
          .maybeSingle()

        if (!progressError && progress?.position_seconds) {
          setStartTime(progress.position_seconds)
        }

        // 4) Fetch signed URL from your API
        const res = await fetch("/api/mux/signed-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playbackId: film.playbackId }),
        })

        const json = await res.json()

        if (!res.ok || !json?.url) {
          throw new Error(json?.error || "Failed to generate signed URL")
        }

        setVideoUrl(json.url)
      } catch (err) {
        console.error("VIDEO ERROR:", err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (slug) load()
  }, [slug, router])

  // ✅ Save progress to Supabase (throttled to every 15s)
  const saveProgress = async (seconds) => {
    const userId = currentUserId.current
    if (!userId || !slug) return

    const now = Date.now()
    if (saveInFlight.current || now - lastSavedAt.current < 15000) return

    saveInFlight.current = true
    lastSavedAt.current = now

    try {
      await supabase.from("watch_progress").upsert(
        {
          user_id: userId,
          slug,
          position_seconds: Math.floor(seconds),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,slug" }
      )
    } catch (err) {
      console.warn("Failed to save watch progress:", err.message)
    } finally {
      saveInFlight.current = false
    }
  }

  const handleTimeUpdate = (event) => {
    const current = event.target?.currentTime
    if (typeof current === "number" && current > 0) {
      saveProgress(current)
    }
  }

  const handleEnded = async () => {
    // When video finishes, set progress to 0 (so next watch starts at beginning)
    const userId = currentUserId.current
    if (!userId || !slug) return
    try {
      await supabase
        .from("watch_progress")
        .upsert(
          {
            user_id: userId,
            slug,
            position_seconds: 0,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,slug" }
        )
    } catch (err) {
      console.warn("Failed to reset progress:", err.message)
    }
  }

  // ⏳ Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white bg-black">
        Loading film...
      </div>
    )
  }

  // ❌ Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white px-6">
        <h2 className="text-xl mb-4">Something went wrong</h2>
        <pre className="text-sm opacity-70 text-center whitespace-pre-wrap">
          {error}
        </pre>
        <button
          className="mt-6 px-6 py-2 bg-red-600 rounded-lg"
          onClick={() => router.push("/browse")}
        >
          Back to Browse
        </button>
      </div>
    )
  }

  // ✅ Player
  return (
    <main className="bg-black min-h-screen text-white p-6">
      <h1 className="text-3xl font-bold mb-2">{film.title}</h1>
      {startTime > 0 && (
        <p className="mb-4 text-sm opacity-75">
          Resuming from {Math.floor(startTime / 60)}:
          {(startTime % 60).toString().padStart(2, "0")}
        </p>
      )}

      <MuxPlayer
        src={videoUrl}
        poster={film.poster}
        streamType="on-demand"
        startTime={startTime}           // ⏩ resume here
        className="w-full h-[75vh]"
        onTimeUpdate={handleTimeUpdate} // 💾 save progress
        onEnded={handleEnded}           // 🔁 reset when finished
      />
    </main>
  )
}
