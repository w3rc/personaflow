'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolPromptEditor } from '@/components/settings/ToolPromptEditor'
import { DEFAULT_TOOL_PROMPTS } from '@/lib/default-tool-prompts'
import { AlertCircle, Settings as SettingsIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

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

export default function SettingsPage() {
  const [prompts, setPrompts] = useState<ToolPrompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPrompts()
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">AI Tools Settings</h1>
              <p className="text-muted-foreground">
                Customize the AI system prompts for each communication tool
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-blue-900">
                <p>
                  <strong>What are system prompts?</strong> These are instructions given to the AI before each conversation. They define how the AI should behave, what information it has access to, and how it should respond.
                </p>
                <p>
                  <strong>Template Variables:</strong> Use <code className="bg-blue-100 px-1 rounded">{'{{target_name}}'}</code>, <code className="bg-blue-100 px-1 rounded">{'{{disc_type}}'}</code>, <code className="bg-blue-100 px-1 rounded">{'{{strengths}}'}</code>, etc. to insert profile data dynamically.
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
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900">Error loading prompts</p>
                <p className="text-sm text-red-700">{error}</p>
                {error.includes('database table') && (
                  <p className="text-xs text-red-600 mt-2">
                    Please run the <code className="bg-red-100 px-1 rounded">supabase-migration-tool-prompts.sql</code> migration.
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
              <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Loading settings...</p>
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
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Tips for Writing Custom Prompts</CardTitle>
            <CardDescription>Best practices for effective AI prompts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
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
            <div className="pt-3 border-t">
              <strong>Available Variables:</strong> <code className="bg-gray-100 px-1 rounded">{'{{target_name}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{disc_type}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{strengths}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{challenges}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{motivators}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{communication_dos}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{communication_donts}}'}</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
