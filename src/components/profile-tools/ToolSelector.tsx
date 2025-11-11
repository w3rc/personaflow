'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, Mail, Users, TrendingUp } from 'lucide-react'

export interface Tool {
  id: string
  name: string
  description: string
  icon: React.ReactNode
}

export const AI_TOOLS: Tool[] = [
  {
    id: 'first_message',
    name: 'First Message',
    description: 'Generate personalized first LinkedIn message',
    icon: <MessageSquare className="h-4 w-4" />
  },
  {
    id: 'email_composer',
    name: 'Email Composer',
    description: 'Draft professional emails tailored to their personality',
    icon: <Mail className="h-4 w-4" />
  },
  {
    id: 'meeting_prep',
    name: 'Meeting Prep',
    description: 'Get talking points and approach strategies',
    icon: <Users className="h-4 w-4" />
  },
  {
    id: 'relationship_builder',
    name: 'Relationship Builder',
    description: 'Long-term engagement strategies',
    icon: <TrendingUp className="h-4 w-4" />
  }
]

interface ToolSelectorProps {
  activeTool: string
  onSelectTool: (toolId: string) => void
}

export function ToolSelector({ activeTool, onSelectTool }: ToolSelectorProps) {
  return (
    <div className="space-y-4">
      <Tabs value={activeTool} onValueChange={onSelectTool} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          {AI_TOOLS.map((tool) => (
            <TabsTrigger
              key={tool.id}
              value={tool.id}
              className="flex items-center gap-2"
            >
              {tool.icon}
              <span className="hidden sm:inline">{tool.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Tool Description */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <p className="text-sm text-gray-700">
          {AI_TOOLS.find((t) => t.id === activeTool)?.description}
        </p>
      </div>
    </div>
  )
}
