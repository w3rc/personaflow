import { NextRequest, NextResponse } from 'next/server'
import { chatWithAI } from '@/lib/ai-chat'
import { createClient } from '@/lib/supabase/server'
import { createErrorResponse, handleValidationError } from '@/lib/error-handling'
import { DEFAULT_TOOL_PROMPTS, fillPromptTemplate } from '@/lib/default-tool-prompts'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatRequest {
  profileId: string
  toolName: string
  message: string
  conversationHistory?: ChatMessage[]
}

// Valid tool names
const VALID_TOOLS = ['first_message', 'email_composer', 'meeting_prep', 'relationship_builder']


export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { profileId, toolName, message, conversationHistory = [] } = body

    // Validate required fields
    if (!profileId || !toolName || !message) {
      const validationError = handleValidationError({
        errors: ['Missing required fields: profileId, toolName, and message']
      })
      return createErrorResponse(validationError, 400)
    }

    // Validate tool name
    if (!VALID_TOOLS.includes(toolName)) {
      const validationError = handleValidationError({
        errors: ['Invalid tool name. Must be one of: first_message, email_composer, meeting_prep, relationship_builder']
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

    // Fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from('personality_profiles')
      .select('*')
      .eq('id', profileId)
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      const notFoundError = handleValidationError({
        errors: ['Profile not found or access denied']
      })
      return createErrorResponse(notFoundError, 404)
    }

    // Verify profile has personality analysis
    if (!profile.disc_type || !profile.personality_insights) {
      const incompleteError = handleValidationError({
        errors: ['Profile personality analysis is incomplete. Please ensure the profile has been analyzed first.']
      })
      return createErrorResponse(incompleteError, 400)
    }

    // Try to get custom prompt from database
    const { data: customPromptData } = await supabase
      .from('ai_tool_prompts')
      .select('custom_prompt, is_active')
      .eq('user_id', user.id)
      .eq('tool_name', toolName)
      .maybeSingle()

    // Build system prompt - use custom if available and active, otherwise use default
    let systemPrompt: string

    // Prepare profile data for template
    const profileTemplateData = {
      target_name: profile.target_name || 'the recipient',
      disc_type: profile.disc_type || 'Unknown',
      strengths: profile.personality_insights?.strengths || [],
      challenges: profile.personality_insights?.challenges || [],
      motivators: profile.personality_insights?.motivators || [],
      communication_dos: profile.communication_tips?.dos || [],
      communication_donts: profile.communication_tips?.donts || []
    }

    console.log('Profile data for prompt:', {
      name: profileTemplateData.target_name,
      disc_type: profileTemplateData.disc_type,
      has_strengths: profileTemplateData.strengths.length > 0,
      has_dos: profileTemplateData.communication_dos.length > 0
    })

    if (customPromptData && customPromptData.is_active) {
      // Use custom prompt with template variable replacement
      systemPrompt = fillPromptTemplate(customPromptData.custom_prompt, profileTemplateData)
      console.log(`Using custom prompt for ${toolName}`)
    } else {
      // Use default prompt from library
      const defaultPrompt = DEFAULT_TOOL_PROMPTS[toolName as keyof typeof DEFAULT_TOOL_PROMPTS]
      systemPrompt = fillPromptTemplate(defaultPrompt, profileTemplateData)
      console.log(`Using default prompt for ${toolName}`)
    }

    // Add complete LinkedIn profile data as structured context
    const fullProfileContext = `

═══════════════════════════════════════
COMPLETE LINKEDIN PROFILE DATA
═══════════════════════════════════════

**Target Name:** ${profile.target_name || 'Not provided'}

**LinkedIn Profile URL:** ${profile.linkedin_url || 'Not provided'}

**DISC Personality Type:** ${profile.disc_type || 'Not analyzed'}

**Personality Insights:**
${profile.personality_insights ? JSON.stringify(profile.personality_insights, null, 2) : 'Not available'}

**Communication Tips:**
${profile.communication_tips ? JSON.stringify(profile.communication_tips, null, 2) : 'Not available'}

**Professional Summary/About:**
${profile.about_text || 'Not available'}

**Current Position:**
${profile.headline || 'Not available'}

**Raw LinkedIn Data:**
${profile.raw_data ? JSON.stringify(profile.raw_data, null, 2) : 'Not available'}

═══════════════════════════════════════

YOU HAVE ALL THE ABOVE INFORMATION. Use it to generate personalized, specific content. DO NOT ask for more context.
`

    systemPrompt = systemPrompt + fullProfileContext

    // Log a snippet of the filled prompt to verify
    console.log('System prompt preview (first 500 chars):', systemPrompt.substring(0, 500))
    console.log('Full profile context added:', {
      has_about: !!profile.about_text,
      has_headline: !!profile.headline,
      has_raw_data: !!profile.raw_data
    })

    // Call AI with context
    let aiResponse: string
    try {
      aiResponse = await chatWithAI(systemPrompt, conversationHistory, message)
    } catch (aiError) {
      console.error('AI chat error:', aiError)
      aiResponse = 'I apologize, but I\'m having trouble connecting to the AI service right now. Please try again in a moment.'
    }

    // Save conversation to database
    const newMessage: ChatMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [
      ...conversationHistory,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      newMessage
    ]

    // Upsert conversation
    const { data: conversation, error: saveError } = await supabase
      .from('ai_tool_conversations')
      .upsert({
        profile_id: profileId,
        user_id: user.id,
        tool_name: toolName,
        messages: updatedMessages,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'profile_id,user_id,tool_name'
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving conversation:', saveError)
    }

    return NextResponse.json({
      success: true,
      reply: aiResponse,
      conversationId: conversation?.id,
      timestamp: newMessage.timestamp
    })

  } catch (error) {
    console.error('Chat API error:', error)
    const serverError = handleValidationError({
      errors: ['Internal server error during chat']
    })
    return createErrorResponse(serverError, 500)
  }
}
