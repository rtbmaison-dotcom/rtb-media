"use client"

export default function SubscribeButton() {
  return (
    <button
      onClick={() => (window.location.href = "/login?mode=signup")}
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded inline-block"
    >
      Subscribe Now
    </button>
  )
}
