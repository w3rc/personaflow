'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolPromptEditor } from '@/components/settings/ToolPromptEditor'
import { DEFAULT_TOOL_PROMPTS } from '@/lib/default-tool-prompts'
import { AlertCircle, Settings as SettingsIcon, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ToolPrompt {
  id: string
  user_id: string
  tool_name: string
  custom_prompt: string
  is_active: boolean
}

const TOOLS = [
  { name: 'first_message', displayName: 'First Message Generator' },
  { name: 'email_composer', displayName: 'Email Composer' },
  { name: 'meeting_prep', displayName: 'Meeting Prep Assistant' },
  { name: 'relationship_builder', displayName: 'Relationship Builder' }
]

const AI_MODELS = [
  { value: 'anthropic/claude-sonnet-4.5', label: 'Claude Sonnet 4.5', provider: 'Anthropic' },
  { value: 'anthropic/claude-haiku-4.5', label: 'Claude Haiku 4.5', provider: 'Anthropic' },
  { value: 'anthropic/claude-3.7-sonnet', label: 'Claude 3.7 Sonnet', provider: 'Anthropic' },
  { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { value: 'anthropic/claude-3-5-haiku', label: 'Claude 3.5 Haiku', provider: 'Anthropic' },
  { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku', provider: 'Anthropic' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro', provider: 'Google' },
  { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash', provider: 'Google' },
  { value: 'google/gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', provider: 'Google' },
  { value: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash', provider: 'Google' },
  { value: 'google/gemini-flash-1.5-8b', label: 'Gemini Flash 1.5 8B', provider: 'Google' },
  { value: 'google/gemini-flash-1.5', label: 'Gemini Flash 1.5', provider: 'Google' },
  { value: 'google/gemini-pro-1.5', label: 'Gemini Pro 1.5', provider: 'Google' },
  { value: 'openai/gpt-5-chat', label: 'GPT-5 Chat', provider: 'OpenAI' },
  { value: 'openai/gpt-5-mini', label: 'GPT-5 Mini', provider: 'OpenAI' },
  { value: 'openai/gpt-5-nano', label: 'GPT-5 Nano', provider: 'OpenAI' },
  { value: 'openai/gpt-4.1', label: 'GPT-4.1', provider: 'OpenAI' },
  { value: 'openai/gpt-4o', label: 'GPT-4o', provider: 'OpenAI' },
  { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini', provider: 'OpenAI' },
  { value: 'openai/o3', label: 'O3', provider: 'OpenAI' },
  { value: 'openai/gpt-oss-120b', label: 'GPT OSS 120B', provider: 'OpenAI' },
  { value: 'meta-llama/llama-4-maverick', label: 'Llama 4 Maverick', provider: 'Meta' },
  { value: 'meta-llama/llama-4-scout', label: 'Llama 4 Scout', provider: 'Meta' },
  { value: 'meta-llama/llama-3.1-70b-instruct', label: 'Llama 3.1 70B', provider: 'Meta' },
  { value: 'meta-llama/llama-3.1-8b-instruct', label: 'Llama 3.1 8B', provider: 'Meta' },
  { value: 'meta-llama/llama-3.2-3b-instruct', label: 'Llama 3.2 3B', provider: 'Meta' },
  { value: 'meta-llama/llama-3.2-1b-instruct', label: 'Llama 3.2 1B', provider: 'Meta' },
]

export default function SettingsPage() {
  const [prompts, setPrompts] = useState<ToolPrompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<string>('anthropic/claude-3-5-haiku')
  const [isSavingModel, setIsSavingModel] = useState(false)

  useEffect(() => {
    loadPrompts()
    loadModelPreference()
  }, [])

  const loadPrompts = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai-tools/prompts')

      if (!response.ok) {
        throw new Error('Failed to load prompts')
      }

      const data = await response.json()
      setPrompts(data.prompts || [])
    } catch (err) {
      console.error('Error loading prompts:', err)
      setError('Failed to load custom prompts. The database table may not exist yet.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePrompt = async (toolName: string, prompt: string, isActive: boolean) => {
    const response = await fetch('/api/ai-tools/prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        toolName,
        customPrompt: prompt,
        isActive
      })
    })

    if (!response.ok) {
      throw new Error('Failed to save prompt')
    }

    // Reload prompts to get updated data
    await loadPrompts()
  }

  const handleDeletePrompt = async (toolName: string) => {
    const response = await fetch(`/api/ai-tools/prompts?toolName=${toolName}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Failed to delete prompt')
    }

    // Reload prompts to reflect deletion
    await loadPrompts()
  }

  const loadModelPreference = async () => {
    try {
      const response = await fetch('/api/ai-tools/model-preference')
      if (response.ok) {
        const data = await response.json()
        if (data.model) {
          setSelectedModel(data.model)
        }
      }
    } catch (err) {
      console.error('Error loading model preference:', err)
    }
  }

  const handleModelChange = async (model: string) => {
    setSelectedModel(model)
    setIsSavingModel(true)

    try {
      const response = await fetch('/api/ai-tools/model-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model })
      })

      if (!response.ok) {
        throw new Error('Failed to save model preference')
      }
    } catch (err) {
      console.error('Error saving model preference:', err)
      setError('Failed to save model preference')
    } finally {
      setIsSavingModel(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Tools Settings</h1>
              <p className="text-muted-foreground">
                Customize the AI model and system prompts for each communication tool
              </p>
            </div>
          </div>
        </div>

        {/* AI Model Selection */}
        <Card className="mb-6 border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>AI Model Selection</CardTitle>
            </div>
            <CardDescription>
              Choose which AI model to use for communication tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Selected Model
                </label>
                <Select value={selectedModel} onValueChange={handleModelChange} disabled={isSavingModel}>
                  <SelectTrigger className="w-full bg-background border-border/50">
                    <SelectValue placeholder="Select an AI model" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/50">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Anthropic (Recommended)</div>
                    {AI_MODELS.filter(m => m.provider === 'Anthropic').map((model) => (
                      <SelectItem key={model.value} value={model.value} className="hover:bg-primary/10">
                        {model.label}
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Google</div>
                    {AI_MODELS.filter(m => m.provider === 'Google').map((model) => (
                      <SelectItem key={model.value} value={model.value} className="hover:bg-primary/10">
                        {model.label}
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">OpenAI</div>
                    {AI_MODELS.filter(m => m.provider === 'OpenAI').map((model) => (
                      <SelectItem key={model.value} value={model.value} className="hover:bg-primary/10">
                        {model.label}
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Meta</div>
                    {AI_MODELS.filter(m => m.provider === 'Meta').map((model) => (
                      <SelectItem key={model.value} value={model.value} className="hover:bg-primary/10">
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isSavingModel && (
                  <p className="text-xs text-muted-foreground mt-2">Saving preference...</p>
                )}
              </div>
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
                <p className="text-xs text-foreground">
                  <strong>Note:</strong> All models are powered by OpenRouter. Changes take effect immediately for new conversations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mb-6 border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-foreground">
                <p>
                  <strong>What are system prompts?</strong> These are instructions given to the AI before each conversation. They define how the AI should behave, what information it has access to, and how it should respond.
                </p>
                <p>
                  <strong>Template Variables:</strong> Use <code className="bg-secondary px-1 rounded">{'{{target_name}}'}</code>, <code className="bg-secondary px-1 rounded">{'{{disc_type}}'}</code>, <code className="bg-secondary px-1 rounded">{'{{strengths}}'}</code>, etc. to insert profile data dynamically.
                </p>
                <p>
                  <strong>Note:</strong> Changes take effect immediately for new conversations. Existing conversations continue with their original prompts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Error loading prompts</p>
                <p className="text-sm text-destructive">{error}</p>
                {error.includes('database table') && (
                  <p className="text-xs text-destructive mt-2">
                    Please run the <code className="bg-secondary px-1 rounded">supabase-migration-tool-prompts.sql</code> migration.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading settings...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {TOOLS.map((tool) => {
              const customPrompt = prompts.find(p => p.tool_name === tool.name)
              const defaultPrompt = DEFAULT_TOOL_PROMPTS[tool.name as keyof typeof DEFAULT_TOOL_PROMPTS]

              return (
                <ToolPromptEditor
                  key={tool.name}
                  toolName={tool.name}
                  toolDisplayName={tool.displayName}
                  defaultPrompt={defaultPrompt}
                  customPrompt={customPrompt}
                  onSave={handleSavePrompt}
                  onDelete={handleDeletePrompt}
                />
              )
            })}
          </div>
        )}

        {/* Footer Info */}
        <Card className="mt-8 border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-foreground">Tips for Writing Custom Prompts</CardTitle>
            <CardDescription>Best practices for effective AI prompts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground">
            <div>
              <strong>Be Specific:</strong> Clearly define the AI&apos;s role and objectives
            </div>
            <div>
              <strong>Use Context:</strong> Leverage template variables to personalize responses
            </div>
            <div>
              <strong>Set Boundaries:</strong> Specify what the AI should and shouldn&apos;t do
            </div>
            <div>
              <strong>Provide Examples:</strong> Include example outputs to guide the AI
            </div>
            <div>
              <strong>Test Iteratively:</strong> Refine your prompts based on actual results
            </div>
            <div className="pt-3 border-t border-border/50">
              <strong>Available Variables:</strong> <code className="bg-secondary px-1 rounded">{'{{target_name}}'}</code>, <code className="bg-secondary px-1 rounded">{'{{disc_type}}'}</code>, <code className="bg-secondary px-1 rounded">{'{{strengths}}'}</code>, <code className="bg-secondary px-1 rounded">{'{{challenges}}'}</code>, <code className="bg-secondary px-1 rounded">{'{{motivators}}'}</code>, <code className="bg-secondary px-1 rounded">{'{{communication_dos}}'}</code>, <code className="bg-secondary px-1 rounded">{'{{communication_donts}}'}</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
