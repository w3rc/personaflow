import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET endpoint to check current user authentication status
// Used by Chrome extension to get user context
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        message: 'User not authenticated'
      }, { status: 401 })
    }

    // Return sanitized user info (no sensitive data)
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      message: 'User authenticated successfully'
    })

  } catch (error) {
    console.error('Auth check API error:', error)
    return NextResponse.json({
      authenticated: false,
      user: null,
      message: 'Internal server error during authentication check'
    }, { status: 500 })
  }
}