'use client'

import { useRouter } from "next/navigation"

// NOTE:
// The previous version used external UI + animation libraries (framer-motion,
// shadcn/ui Button & Card). In your environment one of those imports was
// resolving to `null`, which caused the runtime error:
//   "TypeError: null is not an object (evaluating 'esm_default2._')".
// This version removes those external dependencies and uses plain
// React + Tailwind elements only, keeping the same visual design but
// avoiding the faulty imports.

export default function Home() {
  const router = useRouter()

  const handleSubscribe = async () => {
    try {
      const res = await fetch('/api/checkout_sessions', { method: 'POST' })

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      const data = await res.json()

      if (!data?.url) {
        throw new Error('Checkout URL missing in response')
      }

      window.location.href = data.url
    } catch (err) {
      console.error('Error creating Stripe session:', err)
      if (typeof window !== 'undefined') {
        alert('There was an error starting your checkout. Please try again.')
      }
    }
  }

  return (
    <main className="bg-[#070B17] text-white min-h-screen w-full flex flex-col">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-6 md:px-10 py-4 bg-[#070B17]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/rtb logo.png" alt="RTB Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
        </div>

        <div className="flex gap-3 md:gap-4 items-center">
          <button
            className="text-sm opacity-80 hover:opacity-100 transition"
            onClick={() => router.push('/login')}
          >
            Sign In
          </button>

          <button
            onClick={handleSubscribe}
            className="bg-red-600 hover:bg-red-700 rounded-xl px-4 md:px-6 py-2 text-sm md:text-base font-semibold transition"
          >
            Get Access
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center text-center px-4 md:px-6 overflow-hidden"
        style={{
          backgroundImage: "url('/hoz poster.JPG')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 max-w-3xl transform transition-transform duration-700 ease-out">
          <div className="inline-block bg-red-600/90 px-4 py-1 rounded-full text-xs md:text-sm mb-6 font-semibold tracking-wide uppercase">
            Now Streaming — Short Film + BTS
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            EXTRICATE
          </h1>

          <p className="text-base md:text-lg opacity-80 mb-10">
            A cinematic experience. Exclusive access. Behind the scenes of the journey.
          </p>

          <div className="flex justify-center gap-4 md:gap-6 flex-wrap">
            <button
              onClick={handleSubscribe}
              className="bg-red-600 hover:bg-red-700 px-8 md:px-10 py-3 md:py-4 rounded-2xl text-base md:text-lg font-semibold transition-transform hover:-translate-y-0.5"
            >
              Get RTB Access
            </button>

            <button
              onClick={() => router.push('/preview')}
              className="border border-white/20 px-8 md:px-10 py-3 md:py-4 rounded-2xl text-base md:text-lg font-semibold hover:bg-white/10 transition-transform hover:-translate-y-0.5"
            >
              Watch Preview
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 md:py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
          Founding Member Benefits
        </h2>
        <p className="opacity-60 text-center mb-12 md:mb-16 text-sm md:text-base">
          Be part of RTB Media from the very beginning.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[
            { title: 'Full Documentary Access', desc: 'Watch the complete EXTRICATE story from concept to screen.' },
            { title: 'Behind the Scenes', desc: 'Raw footage from set and exclusive interviews.' },
            { title: 'Founding Status', desc: 'Early supporter perks + recognition.' },
            { title: 'Early Viewing', desc: 'Watch episodes before public release.' },
            { title: 'Cinema Quality', desc: 'Stunning visuals in HD & 4K.' },
            { title: 'Exclusive Updates', desc: 'Weekly drops + insider news.' },
          ].map((item, i) => (
            <div
              key={item.title}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:border-red-500/40 transition"
            >
              <h3 className="text-lg md:text-xl font-semibold mb-3">{item.title}</h3>
              <p className="opacity-70 leading-relaxed text-sm md:text-base">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EPISODES */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="mb-8 md:mb-10 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Behind the Scenes</h2>
          <p className="opacity-60 text-sm md:text-base">A look into the making of EXTRICATE</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Episode 1 */}
          <article className="bg-white/5 border border-white/10 overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:scale-[1.02] transition-transform">
            <div className="relative">
              <img src="/port poster.jpeg" alt="EXTRICATE – The Vision" className="w-full h-56 md:h-64 object-cover" />
              <span className="absolute top-4 right-4 bg-red-600 text-[0.65rem] md:text-xs px-3 py-1 rounded-full font-semibold tracking-wide uppercase">
                Members Only
              </span>
            </div>

            <div className="p-5 md:p-6">
              <p className="text-xs md:text-sm opacity-60 mb-1">Documentary • Episode 1</p>
              <h3 className="font-semibold text-base md:text-lg">The Vision</h3>
            </div>
          </article>

          {/* Example placeholders for future episodes (kept subtle) */}
          <article className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center opacity-60">
            <p className="text-xs uppercase tracking-wide mb-1">Coming Soon</p>
            <p className="text-sm md:text-base font-medium">Episode 2 • The Shoot</p>
          </article>

          <article className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center opacity-60">
            <p className="text-xs uppercase tracking-wide mb-1">Coming Soon</p>
            <p className="text-sm md:text-base font-medium">Episode 3 • Post Production</p>
          </article>

          <article className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center opacity-60">
            <p className="text-xs uppercase tracking-wide mb-1">Coming Soon</p>
            <p className="text-sm md:text-base font-medium">Episode 4 • Premiere Night</p>
          </article>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-[#070B17] border-t border-white/5 px-6 md:px-10 py-12 md:py-16 text-xs md:text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10">

          {/* BRAND / LOGO */}
          <div className="flex flex-col gap-3">
            <img 
              src="/rtb logo.png" 
              alt="RTB Logo" 
              className="w-14 h-14 object-contain"
            />
            <p className="opacity-60 text-sm md:text-base max-w-xs">
              Premium storytelling through film & culture.
            </p>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="font-semibold mb-3 text-sm md:text-base">Contact</h4>
            <ul className="opacity-60 space-y-2">
              <li>📧 businessrtb@gmail.com</li>
              <li className="flex items-center gap-2">
                <img src="/ig.png" alt="Instagram" className="w-4 h-4" />
                <span>@richerthanbefore</span>
              </li>
            </ul>
          </div>

          {/* STAY UPDATED */}
          <div>
            <h4 className="font-semibold mb-3 text-sm md:text-base">Stay Updated</h4>
            <form
              className="flex mt-1"
              onSubmit={(e) => {
                e.preventDefault()
                // TODO: wire up to your newsletter backend
              }}
            >
              <input
                type="email"
                placeholder="Email address"
                className="bg-white/5 border border-white/10 px-3 md:px-4 py-2 md:py-3 rounded-l-xl w-full focus:outline-none text-xs md:text-sm"
              />
              <button
                type="submit"
                className="bg-red-600 px-4 md:px-5 rounded-r-xl font-semibold text-xs md:text-sm hover:bg-red-700 transition"
              >
                Join
              </button>
            </form>
          </div>

          {/* TERMS */}
          <div className="flex md:items-end">
            <button
              onClick={() => router.push('/terms')}
              className="border border-white/20 px-6 py-3 rounded-xl text-xs md:text-sm font-semibold hover:bg-white/10 transition"
            >
              Terms & Conditions
            </button>
          </div>
        </div>

        <p className="text-center opacity-40 mt-10 md:mt-12 text-[0.7rem] md:text-xs">
          Richer Than Before (RTB) © 2025. All Rights Reserved.
        </p>
      </footer>
    </main>
  )
}
