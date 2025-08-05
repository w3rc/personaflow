import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { createErrorResponse, handleValidationError } from '@/lib/error-handling'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      const validationError = handleValidationError({ 
        errors: ['Profile ID is required'] 
      })
      return createErrorResponse(validationError, 400)
    }

    // First try to get it as a user profile
    const userSupabase = await createClient()
    const { data: { user } } = await userSupabase.auth.getUser()

    if (user) {
      const { data: userProfile } = await userSupabase
        .from('personality_profiles')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (userProfile) {
        return NextResponse.json({
          success: true,
          profile: userProfile,
          source: 'user'
        })
      }
    }

    // If not found as user profile, try as extension profile
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: extensionProfile, error } = await serviceSupabase
      .from('personality_profiles')
      .select('*')
      .eq('id', id)
      .is('user_id', null)
      .single()

    if (error || !extensionProfile) {
      const notFoundError = handleValidationError({ 
        errors: ['Profile not found'] 
      })
      return createErrorResponse(notFoundError, 404)
    }

    return NextResponse.json({
      success: true,
      profile: extensionProfile,
      source: 'extension'
    })

  } catch (error) {
    console.error('Profile fetch API error:', error)
    const serverError = handleValidationError({ 
      errors: ['Internal server error during profile fetch'] 
    })
    return createErrorResponse(serverError, 500)
  }
}