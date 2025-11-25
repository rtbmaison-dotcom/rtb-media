import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseServer'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabaseServer = supabase(req, res)

  const { data: { user } } = await supabaseServer.auth.getUser()

  // Not logged in → redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Fetch subscription
  const { data: subscription } = await supabaseServer
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle()

  // No subscription or not active → redirect to paywall
  if (!subscription || subscription.status !== 'active') {
    return NextResponse.redirect(new URL('/pricing', req.url))
  }

  return res
}

export const config = {
  matcher: ['/browse/:path*'], // protect anything under /browse
}
