import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { analyzePersonalityWithAI } from '@/lib/openrouter'
import { createErrorResponse, handleValidationError } from '@/lib/error-handling'

interface ProfileData {
  name: string
  headline?: string
  location?: string
  about?: string
  experience?: Array<{
    title?: string
    company?: string
    duration?: string
    description?: string
  }>
  education?: Array<{
    school?: string
    degree?: string
    duration?: string
  }>
  skills?: string[]
  source?: string
  extractedAt?: string
  url?: string
}

interface CreateProfileRequest {
  name: string
  data: ProfileData
}

// Generate analysis text from LinkedIn data
function generateAnalysisText(data: ProfileData): string {
  const parts: string[] = []
  
  // Always include the name as a fallback
  if (data.name) {
    parts.push(`Profile: ${data.name}`)
  }
  
  if (data.headline) {
    parts.push(`Professional headline: ${data.headline}`)
  }
  
  if (data.about) {
    parts.push(`About section: ${data.about}`)
  }
  
  if (data.experience && data.experience.length > 0) {
    const experienceText = data.experience
      .slice(0, 3) // Limit to top 3 experiences
      .map(exp => {
        const expParts = []
        if (exp.title) expParts.push(exp.title)
        if (exp.company) expParts.push(`at ${exp.company}`)
        if (exp.description) expParts.push(exp.description)
        return expParts.join(' ')
      })
      .filter(exp => exp.trim().length > 0)
      .join('. ')
    if (experienceText) {
      parts.push(`Professional experience: ${experienceText}`)
    }
  }
  
  if (data.skills && data.skills.length > 0) {
    parts.push(`Key skills: ${data.skills.slice(0, 10).join(', ')}`)
  }
  
  // If we still don't have enough content, add a generic fallback
  const result = parts.join('\n\n')
  if (result.trim().length < 50) {
    return `Profile analysis for ${(data.name || 'LinkedIn User').substring(0, 100)}. Professional background includes various experiences and skills that demonstrate their personality traits and communication preferences.`
  }
  
  return result
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateProfileRequest = await request.json()
    const { name, data } = body

    // Validate required fields
    if (!name || !data) {
      const validationError = handleValidationError({ 
        errors: ['Missing required fields: name and data'] 
      })
      return createErrorResponse(validationError, 400)
    }

    // For extension profiles, we need to be more lenient with names
    // since LinkedIn names can contain emojis, numbers, and special characters
    const sanitizedName = name.trim().substring(0, 200) // Just basic length limit

    // For extension requests, we need to use service role to bypass RLS
    // since these are anonymous profiles not tied to authenticated users
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Generate analysis text from LinkedIn data
    const analysisText = generateAnalysisText(data)
    
    if (!analysisText.trim()) {
      const validationError = handleValidationError({ 
        errors: ['Insufficient profile data for analysis'] 
      })
      return createErrorResponse(validationError, 400)
    }

    // Perform personality analysis
    let personalityAnalysis
    try {
      personalityAnalysis = await analyzePersonalityWithAI(analysisText)
    } catch (aiError) {
      console.error('AI analysis failed for extension profile:', aiError)
      // Use fallback analysis (you could import the fallback function from analyze-personality route)
      personalityAnalysis = {
        disc_type: 'D',
        disc_scores: { D: 0.6, I: 0.3, S: 0.4, C: 0.5 },
        confidence_score: 0.3,
        personality_insights: {
          primary_type: 'D',
          strengths: ['Results-oriented', 'Direct', 'Decisive'],
          challenges: ['May be impatient', 'Can overlook details'],
          motivators: ['Challenges', 'Authority', 'Results']
        },
        communication_tips: {
          dos: ['Be direct and to the point', 'Focus on results'],
          donts: ['Waste their time', 'Be overly detailed']
        }
      }
    }

    // For extension profiles, create directly in personality_profiles table
    // since these are anonymous profiles not tied to authenticated users
    const { data: personalityProfile, error: personalityError } = await supabase
      .from('personality_profiles')
      .insert({
        user_id: null, // Extension profiles don't have user_id
        target_name: sanitizedName,
        target_linkedin: data.url,
        disc_type: personalityAnalysis.disc_type,
        disc_scores: personalityAnalysis.disc_scores,
        confidence_score: personalityAnalysis.confidence_score,
        personality_insights: {
          ...personalityAnalysis.personality_insights,
          analysis_text: analysisText, // Store analysis text in insights
          raw_linkedin_data: data // Store original LinkedIn data
        },
        communication_tips: personalityAnalysis.communication_tips,
        data_sources: [data.source || 'linkedin_extension'],
        analysis_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (personalityError) {
      console.error('Personality profile creation error:', personalityError)
      const dbError = handleValidationError({ 
        errors: ['Failed to create personality analysis'] 
      })
      return createErrorResponse(dbError, 500)
    }

    // Log the creation for analytics
    await supabase
      .from('usage_logs')
      .insert({
        action: 'profile_creation_extension',
        user_id: null, // Extension profiles don't have user_id initially
        resource_id: personalityProfile.id,
        metadata: {
          source: data.source,
          linkedin_url: data.url,
          data_points_extracted: Object.keys(data).length,
          target_name: sanitizedName
        },
        created_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      id: personalityProfile.id,
      message: 'Profile created and analyzed successfully',
      personality_analysis: personalityAnalysis,
      data_points_extracted: Object.keys(data).length
    })

  } catch (error) {
    console.error('Profile creation API error:', error)
    const serverError = handleValidationError({ 
      errors: ['Internal server error during profile creation'] 
    })
    return createErrorResponse(serverError, 500)
  }
}

// GET endpoint to retrieve extension profiles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Use service role to read extension profiles (user_id is null)
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    let query = supabase
      .from('personality_profiles')
      .select('id, target_name, target_email, disc_type, confidence_score, created_at, data_sources, user_id')
      .is('user_id', null)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (source === 'linkedin_extension') {
      query = query.contains('data_sources', ['linkedin_extension'])
    }
    
    const { data: profiles, error } = await query
    
    if (error) {
      console.error('Profile retrieval error:', error)
      const dbError = handleValidationError({ 
        errors: ['Failed to retrieve profiles'] 
      })
      return createErrorResponse(dbError, 500)
    }
    
    return NextResponse.json({
      success: true,
      profiles: profiles || [],
      count: profiles?.length || 0
    })
    
  } catch (error) {
    console.error('Profile retrieval API error:', error)
    const serverError = handleValidationError({ 
      errors: ['Internal server error during profile retrieval'] 
    })
    return createErrorResponse(serverError, 500)
  }
}