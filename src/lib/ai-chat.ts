import axios from 'axios'

const FAL_API_URL = 'https://fal.run/fal-ai/any-llm'
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Generic AI chat function using fal.ai with OpenRouter fallback
 * @param systemPrompt - System instructions for the AI
 * @param messages - Conversation history
 * @param userMessage - Latest user message
 * @returns AI response text
 */
export async function chatWithAI(
  systemPrompt: string,
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  // Try fal.ai first
  try {
    const falKey = process.env.FAL_KEY
    const falModel = process.env.FAL_MODEL || 'anthropic/claude-3-5-haiku'

    if (!falKey) {
      throw new Error('FAL_KEY not configured')
    }

    // Build conversation context
    const conversationContext = messages.length > 0
      ? '\n\nPrevious conversation:\n' + messages.map(msg =>
          `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n')
      : ''

    const fullPrompt = `${conversationContext}\n\nUser: ${userMessage}\n\nAssistant:`

    const response = await axios.post(
      FAL_API_URL,
      {
        prompt: fullPrompt,
        system_prompt: systemPrompt,
        model: falModel,
        temperature: 0.9,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Key ${falKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )

    if (response.data.output) {
      console.log('fal.ai chat successful')
      return response.data.output
    }

    throw new Error('No output from fal.ai')
  } catch (falError) {
    console.error('fal.ai chat failed, trying OpenRouter:', falError)

    // Fallback to OpenRouter
    try {
      const openrouterKey = process.env.OPENROUTER_API_KEY
      const openrouterModel = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-haiku'

      if (!openrouterKey) {
        throw new Error('OPENROUTER_API_KEY not configured')
      }

      // Build messages array for OpenRouter (OpenAI format)
      const chatMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages,
        { role: 'user', content: userMessage }
      ]

      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: openrouterModel,
          messages: chatMessages,
          temperature: 0.9,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${openrouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://personaflow.vercel.app',
            'X-Title': 'PersonaFlow'
          },
          timeout: 30000
        }
      )

      const content = response.data.choices?.[0]?.message?.content

      if (content) {
        console.log('OpenRouter chat successful')
        return content
      }

      throw new Error('No content from OpenRouter')
    } catch (openrouterError) {
      console.error('OpenRouter chat failed:', openrouterError)
      throw new Error('Failed to get AI response from both fal.ai and OpenRouter')
    }
  }
}
