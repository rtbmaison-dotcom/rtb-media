'use client'

import { useEffect, useState } from 'react'
import MuxPlayer from '@mux/mux-player-react'

export default function WatchPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [playbackId, setPlaybackId] = useState(null) // secure playback id or signed URL
  const [error, setError] = useState(null)

  // Reuse your Stripe checkout redirect function (or call your /api/checkout_sessions)
  const handleSubscribe = async () => {
    try {
      const res = await fetch('/api/checkout_sessions', { method: 'POST' })
      const data = await res.json()
      window.location.href = data.url
    } catch (err) {
      console.error('Error creating Stripe session:', err)
      alert('There was an error. Please try again.')
    }
  }

  // Check auth state (expects you have an endpoint /api/me returning { authenticated: boolean })
  useEffect(() => {
    let mounted = true
    const getAuth = async () => {
      try {
        const res = await fetch('/api/me')
        if (!res.ok) throw new Error('Auth check failed')
        const json = await res.json()
        if (!mounted) return
        setIsAuthenticated(!!json.authenticated)
      } catch (err) {
        console.warn('Auth check error:', err)
        setIsAuthenticated(false)
      } finally {
        setLoadingAuth(false)
      }
    }
    getAuth()
    return () => { mounted = false }
  }, [])

  // Get playback ID from server (recommended: server will return signedPlaybackId or public playbackId)
  useEffect(() => {
    let mounted = true
    const fetchPlayback = async () => {
      try {
        const res = await fetch('/api/mux/playback') // implement server route (example below)
        if (!res.ok) throw new Error('Failed to get playback id')
        const json = await res.json()
        if (!mounted) return
        setPlaybackId(json.playbackId) // expects { playbackId: '...' }
      } catch (err) {
        console.error(err)
        setError('Unable to load video. Try again later.')
      }
    }
    fetchPlayback()
    return () => { mounted = false }
  }, [])

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* NAV */}
      <nav className="flex items-center justify-between px-8 py-4 bg-[#0b1230]">
        {/* LEFT SIDE: LOGO + TITLE */}
  <div className="flex items-center gap-3">
    <img 
      src="/rtb logo.png"  // <-- Put logo file in /public/logo.png
      alt="RTB Logo"
      className="w-15 h-15 object-contain"
    />
    <h1 className="text-2xl font-bold"></h1>
  </div>
        <div className="flex gap-4">
          <button className="text-sm">Sign In</button>
          <button onClick={handleSubscribe} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
            Get Access
          </button>
        </div>
      </nav>

      {/* HERO / PLAYER */}
      <section className="relative w-full bg-black">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Player column */}
            <div className="w-full">
              <div className="relative rounded-lg overflow-hidden shadow-lg">
                {error && <div className="p-6 text-center text-red-400">{error}</div>}

                {!playbackId ? (
                  <div className="w-full h-[420px] bg-gray-800 flex items-center justify-center">
                    <div className="text-gray-400">Loading player...</div>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Mux player */}
                    <MuxPlayer
                      playbackId={playbackId}
                      metadata={{
                        video_title: 'EXTRICATE — Episode 1',
                        viewer_user_id: 'anonymous',
                      }}
                      controls
                      streamType="on-demand"
                      style={{ width: '100%', height: '420px', borderRadius: 8 }}
                    />

                    {/* Members-only overlay */}
                    {!loadingAuth && !isAuthenticated && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center gap-4">
                        <div className="text-xl font-semibold">Members Only</div>
                        <div className="max-w-md text-center opacity-80">
                          This content is available to RTB Media members. Subscribe to watch the full film.
                        </div>
                        <div className="flex gap-3 mt-3">
                          <button
                            onClick={handleSubscribe}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold"
                          >
                            Get RTB Access
                          </button>
                          <button
                            onClick={() => alert('Preview would play — replace this with a preview embed')}
                            className="bg-white bg-opacity-10 px-4 py-2 rounded border border-white/10"
                          >
                            Watch Preview
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Info column */}
            <div className="w-full">
              <div className="mb-4">
                <div className="inline-block bg-orange-600/80 px-3 py-1 rounded-full text-sm font-medium">Now Streaming</div>
              </div>
              <h1 className="text-5xl font-extrabold mb-4">EXTRICATE</h1>
              <p className="text-gray-300 mb-6">
                A short film from Cairo. Watch the film and explore exclusive behind-the-scenes content.
              </p>

              <div className="flex gap-3 mb-6">
                <button onClick={handleSubscribe} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold">
                  Get RTB Access
                </button>
                <button className="bg-white bg-opacity-10 px-4 py-2 rounded border border-white/10">
                  Watch Preview
                </button>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-md p-4">
                <h4 className="font-bold mb-2">Details</h4>
                <ul className="text-sm opacity-80 space-y-1">
                  <li>🎬 Runtime: 28m</li>
                  <li>📅 Released: 2025</li>
                  <li>⭐ Rating: 8.9</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EPISODES GRID */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-4">Episodes & Extras</h2>
        <p className="text-gray-400 mb-6">Go behind the scenes of the groundbreaking short film</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'The Vision', type: 'Documentary', episode: 'Episode 1', poster: '/poster1.jpg' },
            { title: 'On Set', type: 'Behind the Scenes', episode: 'Episode 2', poster: '/poster2.jpg' },
            { title: 'The Cast', type: 'Documentary', episode: 'Episode 3', poster: '/poster3.jpg' },
            { title: 'Cairo Rising', type: 'Behind the Scenes', episode: 'Episode 4', poster: '/poster4.jpg' },
          ].map((ep, idx) => (
            <article key={idx} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              <div className="relative">
                <img src={ep.poster} alt={ep.title} className="w-full h-48 object-cover"/>
                <span className="absolute top-3 right-3 bg-orange-600 px-3 py-1 rounded-full text-sm">Members Only</span>
              </div>
              <div className="p-4">
                <div className="text-sm text-gray-400 mb-1">{ep.type} • {ep.episode}</div>
                <h3 className="font-bold">{ep.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0b1230] px-8 py-12 mt-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h3 className="font-bold mb-2">RTB Media</h3>
            <p className="opacity-80">Your exclusive destination for premium content and behind-the-scenes access.</p>
          </div>

          <div>
            <h4 className="font-bold mb-2">Shows</h4>
            <ul className="opacity-80 space-y-1">
              <li>All Shows</li>
              <li>Trending Now</li>
              <li>New Releases</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-2">Company</h4>
            <ul className="opacity-80 space-y-1">
              <li>About Us</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-2">Stay Updated</h4>
            <div className="flex mt-2">
              <input type="email" placeholder="Your email" className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-l-md"/>
              <button className="bg-red-600 px-4 rounded-r-md">Subscribe</button>
            </div>
          </div>
        </div>

        <p className="text-center opacity-50 mt-10">© 2025 RTB Media. All rights reserved.</p>
      </footer>
    </main>
  )
}
