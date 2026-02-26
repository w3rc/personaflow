import axios from 'axios'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

async function callChat(model: string, apiKey: string, chatMessages: ChatMessage[]): Promise<string> {
  const response = await axios.post(
    OPENROUTER_API_URL,
    {
      model,
      messages: chatMessages,
      temperature: 0.9,
      max_tokens: 2000
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

  const content = response.data.choices?.[0]?.message?.content
  if (!content) throw new Error('No content from OpenRouter')
  return content
}

export async function chatWithAI(
  systemPrompt: string,
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  const openrouterKey = process.env.OPENROUTER_API_KEY
  const primaryModel = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-nano-30b-a3b:free'
  const fallbackModel = process.env.OPENROUTER_FALLBACK_MODEL || 'anthropic/claude-3.5-haiku'

  if (!openrouterKey) {
    throw new Error('OPENROUTER_API_KEY not configured')
  }

  const chatMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
    { role: 'user', content: userMessage }
  ]

  try {
    return await callChat(primaryModel, openrouterKey, chatMessages)
  } catch (primaryError) {
    console.error(`Primary model (${primaryModel}) failed, trying fallback:`, primaryError)
    try {
      return await callChat(fallbackModel, openrouterKey, chatMessages)
    } catch (fallbackError) {
      console.error(`Fallback model (${fallbackModel}) failed:`, fallbackError)
      throw new Error('Failed to get AI response')
    }
  }
}
