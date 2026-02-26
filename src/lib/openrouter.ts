import axios from 'axios'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface OpenRouterResponse {
  choices: {
    message: {
      content: string
    }
  }[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
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

async function callOpenRouter(text: string, model: string, apiKey: string): Promise<PersonalityAnalysis> {
  const prompt = `You are an expert personality psychologist specializing in DISC personality assessment with extensive experience analyzing LinkedIn professional communication. Analyze the following text sample and determine the person's DISC personality type based on their communication style, word choice, and behavioral indicators.

DISC Framework:
- D (Dominance): Direct, results-oriented, decisive, assertive, competitive
- I (Influence): Outgoing, enthusiastic, optimistic, people-focused, expressive
- S (Steadiness): Patient, reliable, supportive, stable, team-oriented
- C (Conscientiousness): Analytical, detailed, systematic, careful, quality-focused

LinkedIn Communication Context:
- LinkedIn posts often reflect professional personas, but authentic personality traits still emerge
- Pay attention to: tone formality, use of personal stories vs. pure business content, networking approach, response patterns to others
- High I types often share personal achievements and use engaging language
- High D types tend to be direct, use action-oriented language, focus on results
- High S types emphasize team collaboration, stability, and supportive messaging
- High C types share detailed insights, data-driven content, and methodical thinking

Text to analyze:
"${text}"

Based on this text, provide a comprehensive DISC analysis in the following JSON format:

{
  "disc_scores": {
    "D": 0.0-1.0,
    "I": 0.0-1.0,
    "S": 0.0-1.0,
    "C": 0.0-1.0
  },
  "primary_type": "D|I|S|C",
  "confidence_score": 0.0-1.0,
  "strengths": ["strength1", "strength2", "strength3", "strength4"],
  "challenges": ["challenge1", "challenge2", "challenge3"],
  "motivators": ["motivator1", "motivator2", "motivator3", "motivator4"],
  "communication_dos": ["tip1", "tip2", "tip3", "tip4"],
  "communication_donts": ["avoid1", "avoid2", "avoid3", "avoid4"]
}

Scoring guidelines:
- Scores should reflect the strength of each trait (0.0 = not present, 1.0 = very strong)
- Confidence score should reflect text quality and length (more text = higher confidence)
- Primary type should be the highest scoring dimension
- Provide specific, actionable insights based on the DISC type

Return only valid JSON with no additional text.`

  const response = await axios.post<OpenRouterResponse>(
    OPENROUTER_API_URL,
    {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://personaflow.vercel.app',
        'X-Title': 'PersonaFlow'
      },
      timeout: 30000
    }
  )

  const content = response.data.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response content from OpenRouter')
  }

  const analysisData = JSON.parse(content)

  return {
    disc_type: analysisData.primary_type,
    disc_scores: analysisData.disc_scores,
    confidence_score: analysisData.confidence_score,
    personality_insights: {
      primary_type: analysisData.primary_type,
      strengths: analysisData.strengths || [],
      challenges: analysisData.challenges || [],
      motivators: analysisData.motivators || []
    },
    communication_tips: {
      dos: analysisData.communication_dos || [],
      donts: analysisData.communication_donts || []
    }
  }
}

export async function analyzePersonalityWithOpenRouter(text: string): Promise<PersonalityAnalysis> {
  const apiKey = process.env.OPENROUTER_API_KEY
  const primaryModel = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-nano-30b-a3b:free'
  const fallbackModel = process.env.OPENROUTER_FALLBACK_MODEL || 'anthropic/claude-3.5-haiku'

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured')
  }

  try {
    console.log(`Attempting analysis with primary model: ${primaryModel}`)
    const result = await callOpenRouter(text, primaryModel, apiKey)
    console.log(`Primary model (${primaryModel}) succeeded`)
    return result
  } catch (primaryError) {
    console.error(`Primary model (${primaryModel}) failed, trying fallback:`, primaryError)
    try {
      console.log(`Attempting analysis with fallback model: ${fallbackModel}`)
      const result = await callOpenRouter(text, fallbackModel, apiKey)
      console.log(`Fallback model (${fallbackModel}) succeeded`)
      return result
    } catch (fallbackError) {
      console.error(`Fallback model (${fallbackModel}) failed:`, fallbackError)
      if (axios.isAxiosError(fallbackError) && fallbackError.response?.data) {
        console.error('API Response Error:', fallbackError.response.data)
      }
      throw new Error('Failed to analyze personality with AI')
    }
  }
}

export async function testOpenRouterConnection(): Promise<boolean> {
  try {
    const testAnalysis = await analyzePersonalityWithOpenRouter(
      "I love working with teams and bringing energy to every project. I'm always excited to brainstorm new ideas and connect with people!"
    )
    return !!testAnalysis.disc_type
  } catch (error) {
    console.error('OpenRouter connection test failed:', error)
    return false
  }
}