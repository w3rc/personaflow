'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChatInterface } from './ChatInterface'
import { ToolSelector, AI_TOOLS } from './ToolSelector'
import { AlertCircle, Trash2 } from 'lucide-react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface AIToolsSectionProps {
  profileId: string
  profileData: {
    target_name: string
    disc_type: string
  }
}

export function AIToolsSection({ profileId, profileData }: AIToolsSectionProps) {
  const [activeTool, setActiveTool] = useState('first_message')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  // Load conversation history when tool changes
  useEffect(() => {
    loadConversationHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool, profileId])

  const loadConversationHistory = async () => {
    setIsLoadingHistory(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/ai-tools/conversations?profileId=${profileId}&toolName=${activeTool}`
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        // Check if it's a table not found error (migration not run)
        if (response.status === 500 && errorData.message?.includes('ai_tool_conversations')) {
          setError('Database setup required. Please run the AI tools migration in Supabase.')
          setMessages([])
          setIsLoadingHistory(false)
          return
        }

        throw new Error('Failed to load conversation history')
      }

      const data = await response.json()
      setMessages(data.messages || [])
    } catch (err) {
      console.error('Error loading conversation:', err)
      // Don't show error on first load if table doesn't exist - just start with empty messages
      setMessages([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleSendMessage = async (message: string) => {
    setIsLoading(true)
    setError(null)

    // Add user message immediately for better UX
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }
    setMessages((prev) => [...prev, userMessage])

    try {
      const response = await fetch('/api/ai-tools/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profileId,
          toolName: activeTool,
          message,
          conversationHistory: messages
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      // Add AI response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.reply,
        timestamp: data.timestamp
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to get AI response. Please try again.')
      // Remove the optimistically added user message on error
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = async () => {
    if (!confirm('Are you sure you want to clear this conversation? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(
        `/api/ai-tools/conversations?profileId=${profileId}&toolName=${activeTool}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        throw new Error('Failed to clear conversation')
      }

      setMessages([])
    } catch (err) {
      console.error('Error clearing conversation:', err)
      setError('Failed to clear conversation')
    }
  }

  const handleToolChange = (toolId: string) => {
    setActiveTool(toolId)
    setError(null)
  }

  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">AI Communication Tools</h3>
            <p className="text-sm text-muted-foreground">
              Get personalized communication assistance for {profileData.target_name}
            </p>
          </div>
          {messages.length > 0 && (
            <Button
              onClick={handleClearChat}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Chat
            </Button>
          )}
        </div>

        {/* Tool Selector */}
        <ToolSelector activeTool={activeTool} onSelectTool={handleToolChange} />

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Error</p>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading conversation...</p>
            </div>
          </div>
        ) : (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            toolName={activeTool}
            onClearChat={handleClearChat}
          />
        )}

        {/* Context Info */}
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
          <p className="text-xs text-foreground">
            <strong>Profile Context:</strong> This AI assistant has full access to{' '}
            {profileData.target_name}&apos;s personality profile (DISC Type: {profileData.disc_type}),
            strengths, motivators, and communication preferences to provide personalized advice.
          </p>
        </div>
      </div>
    </Card>
  )
}
