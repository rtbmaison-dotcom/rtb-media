import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET() {
  try {
    const cookieStore = cookies()

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    })

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ isSubscribed: false }),
        { status: 200 }
      )
    }

    // Check subscription in your database (profiles table)
    const { data, error } = await supabase
      .from("profiles")
      .select("is_subscribed")
      .eq("id", user.id)
      .single()

    if (error || !data) {
      return new Response(
        JSON.stringify({ isSubscribed: false }),
        { status: 200 }
      )
    }

    return new Response(
      JSON.stringify({ isSubscribed: data.is_subscribed === true }),
      { status: 200 }
    )

  } catch (err) {
    console.error("Subscription check error:", err)

    return new Response(
      JSON.stringify({ isSubscribed: false }),
      { status: 500 }
    )
  }
}
