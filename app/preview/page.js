'use client'

import MuxPlayer from "@mux/mux-player-react"
import { useRouter } from "next/navigation"

export default function PreviewPage() {
  const router = useRouter()

  return (
    <main className="bg-black min-h-screen flex flex-col items-center pt-6 px-4">

      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="text-white opacity-70 hover:opacity-100 mb-6 self-start ml-2 text-sm"
      >
        ← Back to Home
      </button>

      <div className="w-full max-w-5xl">

        {/* Title */}
        <h1 className="text-white text-3xl font-bold text-center mb-6">
          EXTRICATE — Official Trailer
        </h1>

        {/* MUX PLAYER */}
        <div className="w-full rounded-xl overflow-hidden shadow-xl">
          <MuxPlayer
            src="https://stream.mux.com/QQwJ5nn7dZ5O7KrfQqy8hIrCqGj9MELWjKLszMb02BPo.m3u8"
            metadataVideoTitle="Extricate Trailer"
            metadataViewerUserId="anonymous"
            streamType="on-demand"
            accentColor="#ff0000"
            style={{
              width: "100%",
              height: "auto",
              backgroundColor: "black",
            }}
          />
        </div>

        {/* Description */}
        <p className="text-gray-300 text-center mt-6 max-w-3xl mx-auto text-lg opacity-80">
          Get a first look at EXTRICATE — a gritty, beautifully crafted short film brought to life by RTB Media. 
          Become a member to see the full film and all behind-the-scenes episodes.
        </p>

        {/* CTA Button */}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => router.push("/")}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold"
          >
            Get Full Access
          </button>
        </div>

      </div>
    </main>
  )
}
