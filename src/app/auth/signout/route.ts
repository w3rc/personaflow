import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return NextResponse.redirect(`${request.url}?error=Could not sign out`, {
      status: 302,
    })
  }

  return NextResponse.redirect(`${new URL(request.url).origin}/auth/login`, {
    status: 302,
  })
}