import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { id, email } = await req.json()

    if (!id || !email) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 })
    }

    const { error } = await supabase.from("profiles").insert([
      {
        id,
        email,
        is_subscribed: false,
      }
    ])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
