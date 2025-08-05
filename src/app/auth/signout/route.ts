import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = await createClient()

  // Sign out from Supabase
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Sign out error:', error)
    return NextResponse.redirect(`${new URL(request.url).origin}/auth/login?error=Could not sign out`, {
      status: 302,
    })
  }

  // Clear all auth-related cookies
  const response = NextResponse.redirect(`${new URL(request.url).origin}/auth/login`, {
    status: 302,
  })

  // Remove Supabase auth cookies
  const cookieNames = [
    'sb-access-token',
    'sb-refresh-token',
    'supabase-auth-token',
    'supabase.auth.token'
  ]

  cookieNames.forEach(cookieName => {
    response.cookies.delete(cookieName)
  })

  // Also clear any cookies with supabase prefix
  cookieStore.getAll().forEach(cookie => {
    if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
      response.cookies.delete(cookie.name)
    }
  })

  return response
}