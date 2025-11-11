import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createErrorResponse, handleValidationError } from '@/lib/error-handling'

// GET - Fetch all custom prompts for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      const authErrorResponse = handleValidationError({ errors: ['Unauthorized access'] })
      return createErrorResponse(authErrorResponse, 401)
    }

    // Fetch all prompts for this user
    const { data: prompts, error } = await supabase
      .from('ai_tool_prompts')
      .select('*')
      .eq('user_id', user.id)
      .order('tool_name')

    if (error) {
      console.error('Error fetching prompts:', error)
      const dbError = handleValidationError({
        errors: ['Failed to fetch custom prompts']
      })
      return createErrorResponse(dbError, 500)
    }

    return NextResponse.json({
      success: true,
      prompts: prompts || []
    })

  } catch (error) {
    console.error('Get prompts API error:', error)
    const serverError = handleValidationError({
      errors: ['Internal server error']
    })
    return createErrorResponse(serverError, 500)
  }
}

// POST - Create or update a custom prompt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { toolName, customPrompt, isActive = true } = body

    if (!toolName || !customPrompt) {
      const validationError = handleValidationError({
        errors: ['Missing required fields: toolName and customPrompt']
      })
      return createErrorResponse(validationError, 400)
    }

    // Validate tool name
    const validTools = ['first_message', 'email_composer', 'meeting_prep', 'relationship_builder']
    if (!validTools.includes(toolName)) {
      const validationError = handleValidationError({
        errors: ['Invalid tool name']
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

    // Upsert the custom prompt
    const { data: prompt, error } = await supabase
      .from('ai_tool_prompts')
      .upsert({
        user_id: user.id,
        tool_name: toolName,
        custom_prompt: customPrompt,
        is_active: isActive,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,tool_name'
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving prompt:', error)
      const dbError = handleValidationError({
        errors: ['Failed to save custom prompt']
      })
      return createErrorResponse(dbError, 500)
    }

    return NextResponse.json({
      success: true,
      prompt,
      message: 'Custom prompt saved successfully'
    })

  } catch (error) {
    console.error('Save prompt API error:', error)
    const serverError = handleValidationError({
      errors: ['Internal server error']
    })
    return createErrorResponse(serverError, 500)
  }
}

// DELETE - Delete a custom prompt (revert to default)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const toolName = searchParams.get('toolName')

    if (!toolName) {
      const validationError = handleValidationError({
        errors: ['Missing required query parameter: toolName']
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

    // Delete the custom prompt
    const { error } = await supabase
      .from('ai_tool_prompts')
      .delete()
      .eq('user_id', user.id)
      .eq('tool_name', toolName)

    if (error) {
      console.error('Error deleting prompt:', error)
      const dbError = handleValidationError({
        errors: ['Failed to delete custom prompt']
      })
      return createErrorResponse(dbError, 500)
    }

    return NextResponse.json({
      success: true,
      message: 'Custom prompt deleted successfully. Default prompt will be used.'
    })

  } catch (error) {
    console.error('Delete prompt API error:', error)
    const serverError = handleValidationError({
      errors: ['Internal server error']
    })
    return createErrorResponse(serverError, 500)
  }
}
