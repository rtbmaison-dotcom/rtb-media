import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function POST(request) {
  try {
    const { playbackId } = await request.json()

    if (!playbackId) {
      return NextResponse.json({ error: "Missing playbackId" }, { status: 400 })
    }

    if (!process.env.MUX_SIGNING_KEY_ID || !process.env.MUX_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "Missing Mux signing environment variables" },
        { status: 500 }
      )
    }

    // Create 1 hour JWT for Mux
    const token = jwt.sign(
      {
        sub: playbackId,
        aud: "v",
        exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour
      },
      process.env.MUX_PRIVATE_KEY,
      {
        algorithm: "RS256",
        keyid: process.env.MUX_SIGNING_KEY_ID
      }
    )

    const signedUrl = `https://stream.mux.com/${playbackId}.m3u8?token=${token}`

    return NextResponse.json({ url: signedUrl })
  } catch (error) {
    console.error("JWT ERROR:", error)
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    )
  }
}
