import { NextRequest, NextResponse } from 'next/server'
import { analyzePersonalityWithAI } from '@/lib/openrouter'
import { createClient } from '@/lib/supabase/server'

interface AnalysisRequest {
  text: string
  userId: string
}

interface PersonalityAnalysis {
  disc_type: string
  disc_scores: {
    D: number
    I: number
    S: number
    C: number
  }
  confidence_score: number
  personality_insights: {
    primary_type: string
    strengths: string[]
    challenges: string[]
    motivators: string[]
  }
  communication_tips: {
    dos: string[]
    donts: string[]
  }
}

// Fallback analysis function (same as client-side)
function getBasicAnalysis(text: string): PersonalityAnalysis {
  const words = text.toLowerCase()
  
  let dScore = 0
  let iScore = 0
  let sScore = 0
  let cScore = 0

  // Simple keyword-based scoring (fallback)
  if (words.includes('goal') || words.includes('result') || words.includes('challenge') || words.includes('direct')) dScore += 0.3
  if (words.includes('team') || words.includes('people') || words.includes('enthusiastic') || words.includes('social')) iScore += 0.3
  if (words.includes('stable') || words.includes('reliable') || words.includes('supportive') || words.includes('patient')) sScore += 0.3
  if (words.includes('detail') || words.includes('accurate') || words.includes('careful') || words.includes('analytical')) cScore += 0.3

  // Add some randomness
  dScore += Math.random() * 0.4
  iScore += Math.random() * 0.4
  sScore += Math.random() * 0.4
  cScore += Math.random() * 0.4

  const scores = { D: dScore, I: iScore, S: sScore, C: cScore }
  const primaryType = Object.keys(scores).reduce((a, b) => scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b)

  const getStrengths = (type: string) => {
    const strengths = {
      D: ['Direct', 'Results-oriented', 'Decisive', 'Confident'],
      I: ['Enthusiastic', 'People-oriented', 'Optimistic', 'Persuasive'],
      S: ['Patient', 'Reliable', 'Supportive', 'Good listener'],
      C: ['Analytical', 'Detailed', 'Systematic', 'Quality-focused']
    }
    return strengths[type as keyof typeof strengths] || []
  }

  const getChallenges = (type: string) => {
    const challenges = {
      D: ['Can be impatient', 'May overlook details', 'Can seem pushy'],
      I: ['May lack follow-through', 'Can be disorganized', 'May overpromise'],
      S: ['Resistant to change', 'May avoid conflict', 'Can be indecisive'],
      C: ['Can be perfectionistic', 'May overthink', 'Can seem critical']
    }
    return challenges[type as keyof typeof challenges] || []
  }

  const getMotivators = (type: string) => {
    const motivators = {
      D: ['Challenges', 'Authority', 'Results', 'Efficiency'],
      I: ['Recognition', 'Social interaction', 'Variety', 'Flexibility'],
      S: ['Security', 'Stability', 'Appreciation', 'Clear expectations'],
      C: ['Quality', 'Accuracy', 'Logic', 'Expertise']
    }
    return motivators[type as keyof typeof motivators] || []
  }

  const getCommunicationTips = (type: string) => {
    const tips = {
      D: {
        dos: ['Be direct and to the point', 'Focus on results', 'Give them control', 'Be efficient'],
        donts: ['Waste their time', 'Be overly detailed', 'Take decisions away', 'Be indecisive']
      },
      I: {
        dos: ['Be enthusiastic', 'Allow time for socializing', 'Give public recognition', 'Be optimistic'],
        donts: ['Be too serious', 'Ignore their ideas', 'Focus only on details', 'Be negative']
      },
      S: {
        dos: ['Be patient and supportive', 'Give time to process', 'Show appreciation', 'Be consistent'],
        donts: ['Rush them', 'Create sudden changes', 'Be confrontational', 'Ignore their concerns']
      },
      C: {
        dos: ['Provide details and data', 'Be logical', 'Give time to analyze', 'Be accurate'],
        donts: ['Be vague', 'Rush decisions', 'Ignore their questions', 'Be overly emotional']
      }
    }
    return tips[type as keyof typeof tips] || { dos: [], donts: [] }
  }

  return {
    disc_type: primaryType,
    disc_scores: scores,
    confidence_score: 0.5, // Lower confidence for fallback
    personality_insights: {
      primary_type: primaryType,
      strengths: getStrengths(primaryType),
      challenges: getChallenges(primaryType),
      motivators: getMotivators(primaryType)
    },
    communication_tips: getCommunicationTips(primaryType)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: AnalysisRequest = await request.json()
    const { text, userId } = body

    // Validate input
    if (!text || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: text and userId' },
        { status: 400 }
      )
    }

    if (text.length < 10) {
      return NextResponse.json(
        { error: 'Text must be at least 10 characters long for analysis' },
        { status: 400 }
      )
    }

    // Verify user authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check user's subscription limits (optional)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('monthly_profile_limit, profiles_used')
      .eq('user_id', userId)
      .single()

    const { data: existingProfiles } = await supabase
      .from('personality_profiles')
      .select('id')
      .eq('user_id', userId)

    const profilesUsed = existingProfiles?.length || 0
    const limit = subscription?.monthly_profile_limit || 5

    if (profilesUsed >= limit) {
      return NextResponse.json(
        { error: 'Monthly profile limit reached. Please upgrade your plan.' },
        { status: 429 }
      )
    }

    let analysis: PersonalityAnalysis

    try {
      // Try AI analysis first
      console.log('Attempting AI analysis for user:', userId)
      analysis = await analyzePersonalityWithAI(text)
      console.log('AI analysis successful')
    } catch (aiError) {
      console.error('AI analysis failed, using fallback:', aiError)
      // Fallback to basic analysis
      analysis = getBasicAnalysis(text)
    }

    return NextResponse.json({
      success: true,
      analysis
    })

  } catch (error) {
    console.error('Analysis API error:', error)
    return NextResponse.json(
      { error: 'Internal server error during analysis' },
      { status: 500 }
    )
  }
}