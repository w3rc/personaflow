import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createErrorResponse, handleValidationError } from '@/lib/error-handling'

// GET - Fetch conversation history for a specific tool
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profileId')
    const toolName = searchParams.get('toolName')

    if (!profileId || !toolName) {
      const validationError = handleValidationError({
        errors: ['Missing required query parameters: profileId and toolName']
      })
      return createErrorResponse(validationError, 400)
    }

    // Verify user authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      const authErrorResponse = handleValidationError({ errors: ['Unauthorized access'] })
      return createErrorResponse(authErrorResponse, 401)
    }

    // Fetch conversation
    const { data: conversation, error } = await supabase
      .from('ai_tool_conversations')
      .select('*')
      .eq('profile_id', profileId)
      .eq('user_id', user.id)
      .eq('tool_name', toolName)
      .maybeSingle()

    if (error) {
      console.error('Error fetching conversation:', error)
      const dbError = handleValidationError({
        errors: ['Failed to fetch conversation']
      })
      return createErrorResponse(dbError, 500)
    }

    return NextResponse.json({
      success: true,
      conversation: conversation || null,
      messages: conversation?.messages || []
    })

  } catch (error) {
    console.error('Get conversation API error:', error)
    const serverError = handleValidationError({
      errors: ['Internal server error']
    })
    return createErrorResponse(serverError, 500)
  }
}

// DELETE - Clear conversation history for a specific tool
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profileId')
    const toolName = searchParams.get('toolName')

    if (!profileId || !toolName) {
      const validationError = handleValidationError({
        errors: ['Missing required query parameters: profileId and toolName']
      })
      return createErrorResponse(validationError, 400)
    }

    // Verify user authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      const authErrorResponse = handleValidationError({ errors: ['Unauthorized access'] })
      return createErrorResponse(authErrorResponse, 401)
    }

    // Delete conversation
    const { error } = await supabase
      .from('ai_tool_conversations')
      .delete()
      .eq('profile_id', profileId)
      .eq('user_id', user.id)
      .eq('tool_name', toolName)

    if (error) {
      console.error('Error deleting conversation:', error)
      const dbError = handleValidationError({
        errors: ['Failed to delete conversation']
      })
      return createErrorResponse(dbError, 500)
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation cleared successfully'
    })

  } catch (error) {
    console.error('Delete conversation API error:', error)
    const serverError = handleValidationError({
      errors: ['Internal server error']
    })
    return createErrorResponse(serverError, 500)
  }
}
