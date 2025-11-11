'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Check, RotateCcw, Save } from 'lucide-react'

interface ToolPrompt {
  id?: string
  tool_name: string
  custom_prompt: string
  is_active: boolean
}

interface ToolPromptEditorProps {
  toolName: string
  toolDisplayName: string
  defaultPrompt: string
  customPrompt?: ToolPrompt
  onSave: (toolName: string, prompt: string, isActive: boolean) => Promise<void>
  onDelete: (toolName: string) => Promise<void>
}

export function ToolPromptEditor({
  toolName,
  toolDisplayName,
  defaultPrompt,
  customPrompt,
  onSave,
  onDelete
}: ToolPromptEditorProps) {
  const [prompt, setPrompt] = useState(customPrompt?.custom_prompt || defaultPrompt)
  const [isActive, setIsActive] = useState(customPrompt?.is_active ?? true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [expanded, setExpanded] = useState(false)

  const hasCustomPrompt = !!customPrompt
  const isModified = prompt !== (customPrompt?.custom_prompt || defaultPrompt) ||
                     isActive !== (customPrompt?.is_active ?? true)

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')

    try {
      await onSave(toolName, prompt, isActive)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving prompt:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetToDefault = async () => {
    if (!confirm('Are you sure you want to reset to the default prompt? This will delete your custom prompt.')) {
      return
    }

    setIsDeleting(true)
    try {
      await onDelete(toolName)
      setPrompt(defaultPrompt)
      setIsActive(true)
    } catch (error) {
      console.error('Error deleting prompt:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRevert = () => {
    setPrompt(customPrompt?.custom_prompt || defaultPrompt)
    setIsActive(customPrompt?.is_active ?? true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {toolDisplayName}
              {hasCustomPrompt && (
                <Badge variant="secondary" className="text-xs">
                  Custom
                </Badge>
              )}
              {!isActive && (
                <Badge variant="outline" className="text-xs">
                  Using Default
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Customize the AI system prompt for this tool
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {/* Active Toggle */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id={`active-${toolName}`}
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor={`active-${toolName}`} className="text-sm cursor-pointer">
              Use custom prompt (uncheck to use default)
            </label>
          </div>

          {/* Prompt Editor */}
          <div className="space-y-2">
            <label className="text-sm font-medium">System Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
              placeholder="Enter your custom system prompt..."
            />
            <p className="text-xs text-muted-foreground">
              This prompt will be sent to the AI before each conversation. Use variables like{' '}
              <code className="bg-gray-100 px-1 rounded">{'{{target_name}}'}</code>,{' '}
              <code className="bg-gray-100 px-1 rounded">{'{{disc_type}}'}</code>, etc.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              {hasCustomPrompt && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetToDefault}
                  disabled={isDeleting || isSaving}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Default
                </Button>
              )}
              {isModified && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRevert}
                  disabled={isSaving}
                >
                  Cancel Changes
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {saveStatus === 'success' && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Saved!
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Error saving
                </span>
              )}
              <Button
                onClick={handleSave}
                disabled={!isModified || isSaving}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Prompt'}
              </Button>
            </div>
          </div>

          {/* Default Prompt Preview (if using custom) */}
          {hasCustomPrompt && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                View default prompt
              </summary>
              <pre className="mt-2 p-3 bg-gray-50 rounded border overflow-x-auto whitespace-pre-wrap">
                {defaultPrompt}
              </pre>
            </details>
          )}
        </CardContent>
      )}
    </Card>
  )
}
