'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb,
  FileText,
  MessageSquare,
  Mail,
  Users,
  ExternalLink
} from 'lucide-react'

const contentExamples = {
  colleague: {
    slack: `Hey team! Just wanted to share an update on the Q3 metrics. We're seeing some really promising trends in user engagement, particularly around the new dashboard features we shipped last month. 

I think we should consider doubling down on the personalization aspect - the data shows users are spending 40% more time in sections that adapt to their preferences. 

What do you all think about prioritizing this for our next sprint? I'm happy to put together a proposal if there's interest.`,
    
    email: `Hi Sarah,

Thanks for your feedback on the proposal. I appreciate you taking the time to review it so thoroughly.

You're absolutely right about the timeline concerns. I was being a bit ambitious with the Q4 deadline. How about we push it to Q1 and use the extra time to really nail the user research phase?

I'd love to set up a quick call this week to discuss the resource allocation. Are you free Thursday afternoon?

Best,
Alex`,
    
    meeting: `From our standup this morning:

"I'm feeling good about the progress on the authentication refactor. The main challenge we're facing is the legacy database schema - it's more complex than we initially thought. 

I'd rather take an extra week to do this right than rush it and create technical debt. I know it impacts the timeline, but I think it's the responsible approach.

Happy to walk anyone through the technical details if that would be helpful for planning."`
  },
  
  client: {
    feedback: `Thank you for the detailed walkthrough of the new system. I'm impressed with how you've addressed most of our initial concerns, particularly around data security and user permissions.

The interface is much more intuitive than our current solution. My team especially likes the dashboard customization options - that's going to save us a lot of time.

One question: is there flexibility in the reporting frequency? We'd ideally like daily reports for the first month as we transition, then move to weekly.

Overall, this looks like exactly what we need. When can we schedule the implementation kickoff?`,
    
    testimonial: `Working with this team has been transformative for our business. They didn't just deliver a product - they took the time to understand our unique challenges and crafted a solution that fits perfectly.

The communication throughout the project was exceptional. They explained complex technical concepts in ways our non-technical stakeholders could understand, and they were always responsive to our questions and concerns.

Six months in, we're seeing 30% better efficiency in our core processes. I wouldn't hesitate to recommend them to other companies looking for a true technology partner.`
  },
  
  manager: {
    feedback: `Hi John,

I wanted to follow up on our conversation about the team structure changes. After thinking it over, I believe the cross-functional approach you suggested makes a lot of sense.

The main thing I want to ensure is that we maintain clear accountability and communication channels. Could we set up weekly check-ins during the transition period?

Also, I'd like to get the team's input before we finalize anything. Would you be open to presenting the proposal at our next all-hands meeting?

Thanks for being so thoughtful about this. I appreciate how you always consider the impact on the team.`,
    
    directive: `Team,

As we head into Q4, I want to make sure we're all aligned on priorities. Our main focus should be:

1. Completing the customer onboarding improvements
2. Stabilizing the new API endpoints
3. Beginning research for the 2024 roadmap

I know it's a lot, but I have full confidence in this team's ability to deliver. If anyone is feeling overwhelmed or needs additional resources, please don't hesitate to reach out.

Let's aim to have a planning session next week to break these down into manageable chunks.`
  }
}

const dataSources = [
  { id: 'LinkedIn Posts', label: 'LinkedIn Posts', icon: Users, desc: 'Original posts and professional updates' },
  { id: 'LinkedIn About', label: 'LinkedIn About', icon: FileText, desc: 'Profile summary and background' },
  { id: 'LinkedIn Comments', label: 'LinkedIn Comments', icon: MessageSquare, desc: 'Comments on others\' posts' },
  { id: 'Email', label: 'Email Communication', icon: Mail, desc: 'Professional email exchanges' },
  { id: 'Slack/Teams', label: 'Slack/Teams', icon: MessageSquare, desc: 'Chat messages and conversations' },
  { id: 'Meeting Notes', label: 'Meeting Notes', icon: FileText, desc: 'Meeting contributions and discussions' },
  { id: 'Feedback', label: 'Feedback/Reviews', icon: Users, desc: 'Performance reviews or testimonials' },
  { id: 'Other', label: 'Other Sources', icon: ExternalLink, desc: 'Documents, presentations, etc.' }
]

interface ContentSuggestionsProps {
  template?: string
  scenario?: string
  onContentChange: (content: string) => void
  onDataSourcesChange: (sources: string[]) => void
}

export function ContentSuggestions({ 
  template, 
  scenario, 
  onContentChange, 
  onDataSourcesChange 
}: ContentSuggestionsProps) {
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [copiedExample, setCopiedExample] = useState<string | null>(null)
  const [showAllTips, setShowAllTips] = useState(false)

  const handleSourceToggle = (sourceId: string) => {
    const updated = selectedSources.includes(sourceId)
      ? selectedSources.filter(id => id !== sourceId)
      : [...selectedSources, sourceId]
    
    setSelectedSources(updated)
    onDataSourcesChange(updated)
  }

  const copyExample = (content: string, exampleId: string) => {
    navigator.clipboard.writeText(content)
    onContentChange(content)
    setCopiedExample(exampleId)
    setTimeout(() => setCopiedExample(null), 2000)
  }

  const examples = template ? contentExamples[template as keyof typeof contentExamples] : null

  const contentTips = [
    {
      title: "Mix Different Types",
      description: "Combine formal (emails) and informal (chat) communications for better accuracy",
      icon: "🎯"
    },
    {
      title: "Look for Opinions",
      description: "Personal thoughts and opinions reveal more personality than facts or data",
      icon: "💭"
    },
    {
      title: "Include Responses",
      description: "How they respond to others shows communication style and preferences",
      icon: "💬"
    },
    {
      title: "Recent is Better",
      description: "Use recent content (last 6 months) for current personality insights",
      icon: "📅"
    },
    {
      title: "Avoid Templates",
      description: "Skip automated responses, signatures, and copy-pasted content",
      icon: "🚫"
    },
    {
      title: "Quality over Quantity",
      description: "200 words of authentic content beats 1000 words of generic text",
      icon: "⭐"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Data Sources Selection */}
      <div>
        <h4 className="font-medium mb-3">📋 Select Your Data Sources</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Check all sources you plan to use. This helps us provide better analysis.
        </p>
        
        <div className="grid gap-2 md:grid-cols-2">
          {dataSources.map((source) => {
            const Icon = source.icon
            const isSelected = selectedSources.includes(source.id)
            
            return (
              <label 
                key={source.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSourceToggle(source.id)}
                  className="rounded border-gray-300 mt-1"
                />
                <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <span className="text-sm font-medium">{source.label}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{source.desc}</p>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      {/* Content Tips */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center space-x-2">
              <Lightbulb className="h-4 w-4" />
              <span>Content Collection Tips</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllTips(!showAllTips)}
            >
              {showAllTips ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {contentTips.slice(0, showAllTips ? contentTips.length : 3).map((tip, index) => (
              <div key={index} className="flex items-start space-x-3">
                <span className="text-lg">{tip.icon}</span>
                <div>
                  <h5 className="font-medium text-sm">{tip.title}</h5>
                  <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
          {!showAllTips && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllTips(true)}
              className="mt-3 text-xs"
            >
              Show {contentTips.length - 3} more tips
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Example Content */}
      {examples && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📝 Example Content</CardTitle>
            <p className="text-sm text-muted-foreground">
              Click to copy these examples as starting points for your analysis.
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={Object.keys(examples)[0]} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {Object.entries(examples).map(([key, _]) => (
                  <TabsTrigger key={key} value={key} className="text-xs">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {Object.entries(examples).map(([key, content]) => (
                <TabsContent key={key} value={key} className="mt-4">
                  <div className="relative">
                    <div className="bg-muted/50 rounded-lg p-4 text-sm font-mono text-muted-foreground max-h-40 overflow-y-auto">
                      {content}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyExample(content, key)}
                      className="absolute top-2 right-2"
                    >
                      {copiedExample === key ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          Use Example
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Mix 2-3 different types of content for best results</li>
          <li>• Include both professional and casual communications</li>
          <li>• Look for content where they express opinions or preferences</li>
          <li>• 200+ characters needed for meaningful analysis</li>
        </ul>
      </div>
    </div>
  )
}