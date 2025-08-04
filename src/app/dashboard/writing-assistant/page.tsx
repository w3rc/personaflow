'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, Lightbulb, Copy, RefreshCw, Send } from 'lucide-react'

function WritingAssistantContent() {
  const searchParams = useSearchParams()
  const profileId = searchParams.get('profile')
  const templateId = searchParams.get('template')
  
  const [profile, setProfile] = useState<any>(null)
  const [template, setTemplate] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [tips, setTips] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    if (profileId) {
      loadProfile(profileId)
    }
    if (templateId) {
      loadTemplate(templateId)
    }
  }, [profileId, templateId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadProfile = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('personality_profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setProfile(data)
      setTips(data.communication_tips)
    } catch (err: any) {
      setError('Failed to load profile')
    }
  }

  const loadTemplate = async (id: string) => {
    try {
      // Default templates
      const defaultTemplates = [
        {
          id: 'default-1',
          name: 'Cold Email - D Type',
          template_content: `Subject: Quick solution for [COMPANY] - 2 minute read

Hi [NAME],

I'll be direct: I have a solution that can increase [COMPANY]'s [METRIC] by [PERCENTAGE]% in [TIMEFRAME].

Key benefits:
• [BENEFIT_1] 
• [BENEFIT_2]
• [BENEFIT_3]

I know your time is valuable. Can we schedule a 15-minute call this week to discuss the details?

Best regards,
[YOUR_NAME]`,
          disc_type: 'D',
          variables: ['NAME', 'COMPANY', 'METRIC', 'PERCENTAGE', 'TIMEFRAME', 'BENEFIT_1', 'BENEFIT_2', 'BENEFIT_3', 'YOUR_NAME']
        },
        {
          id: 'default-2',
          name: 'Follow-up Email - I Type',
          template_content: `Subject: Great meeting you at [EVENT]! 🎉

Hi [NAME]!

It was fantastic meeting you at [EVENT] yesterday! I really enjoyed our conversation about [TOPIC] - your insights were incredibly valuable.

As promised, I'm attaching [RESOURCE] that we discussed. I think you'll find it really helpful for [USE_CASE].

I'd love to continue our conversation over coffee sometime. Are you free next week for a quick chat? I have some exciting ideas I'd love to share with you!

Looking forward to hearing from you!

Cheers,
[YOUR_NAME]

P.S. Congratulations again on [ACHIEVEMENT]! 🎊`,
          disc_type: 'I',
          variables: ['NAME', 'EVENT', 'TOPIC', 'RESOURCE', 'USE_CASE', 'ACHIEVEMENT', 'YOUR_NAME']
        }
      ]

      // Check if it's a default template first
      let foundTemplate = defaultTemplates.find(t => t.id === id)
      
      // If not found in defaults, try to fetch from database
      if (!foundTemplate) {
        const { data, error } = await supabase
          .from('communication_templates')
          .select('*')
          .eq('id', id)
          .single()
        
        if (!error && data) {
          foundTemplate = data
        }
      }

      if (foundTemplate) {
        setTemplate(foundTemplate)
        setMessage(foundTemplate.template_content)
        const subjectLine = foundTemplate.template_content.split('\n')[0]
        setSubject(subjectLine.startsWith('Subject: ') ? subjectLine.replace('Subject: ', '') : subjectLine)
      }
    } catch (err: any) {
      setError('Failed to load template')
    }
  }

  const generateSuggestions = () => {
    setLoading(true)
    
    // Mock AI suggestions based on personality type
    setTimeout(() => {
      const discType = profile?.disc_type || template?.disc_type || 'D'
      
      const suggestionsByType = {
        D: [
          "Start with the bottom line - what's the key outcome?",
          "Use bullet points to make it scannable",
          "Include a clear call-to-action with a deadline",
          "Emphasize results and ROI",
          "Keep it under 150 words"
        ],
        I: [
          "Add a personal touch or story",
          "Use enthusiastic language and emojis",
          "Mention social proof or mutual connections",
          "Include opportunities for collaboration",
          "Make it feel conversational and warm"
        ],
        S: [
          "Start with appreciation or acknowledgment",
          "Provide context and background information",
          "Be patient and supportive in tone",
          "Offer help and assistance",
          "End with reassurance"
        ],
        C: [
          "Include specific data and details",
          "Provide logical reasoning for requests",
          "Attach supporting documents",
          "Use precise language",
          "Allow time for thorough review"
        ]
      }

      setSuggestions(suggestionsByType[discType as keyof typeof suggestionsByType] || suggestionsByType.D)
      setLoading(false)
    }, 1000)
  }

  const optimizeSubject = () => {
    const discType = profile?.disc_type || template?.disc_type || 'D'
    
    const subjectOptimizations = {
      D: [
        "ACTION REQUIRED: [Topic] - Response needed by [Date]",
        "URGENT: [Benefit] for [Company] - 2 min read",
        "RESULTS: [Metric] increase opportunity"
      ],
      I: [
        "Exciting opportunity for [Name]! 🎉",
        "Great news about [Topic] - let's celebrate!",
        "[Name], I'd love your thoughts on this!"
      ],
      S: [
        "Checking in on [Project] - here to help",
        "Update on [Topic] - no action required",
        "Supporting you with [Task]"
      ],
      C: [
        "Detailed analysis: [Topic] with supporting data",
        "Comprehensive review of [Project] - 15 attachments",
        "Methodical approach to [Challenge]"
      ]
    }

    const suggestions = subjectOptimizations[discType as keyof typeof subjectOptimizations] || subjectOptimizations.D
    setSubject(suggestions[Math.floor(Math.random() * suggestions.length)])
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const discTypeColors = {
    D: 'bg-red-100 text-red-800',
    I: 'bg-yellow-100 text-yellow-800',
    S: 'bg-green-100 text-green-800',
    C: 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Writing Assistant</h1>
          <p className="text-muted-foreground mt-2">
            Get personalized suggestions for your messages
          </p>
          
          {profile && (
            <div className="flex items-center space-x-2 mt-4">
              <span className="text-sm">Writing for:</span>
              <Badge variant="secondary">{profile.target_name}</Badge>
              <Badge variant="outline" className={discTypeColors[profile.disc_type as keyof typeof discTypeColors]}>
                DISC: {profile.disc_type}
              </Badge>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compose Your Message</CardTitle>
                <CardDescription>
                  Write your message and get personality-based suggestions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject Line</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter your subject line"
                    />
                    <Button variant="outline" size="sm" onClick={optimizeSubject}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Message Content</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message here..."
                    className="min-h-[300px]"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={generateSuggestions} disabled={loading}>
                    {loading ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Lightbulb className="mr-2 h-4 w-4" />
                    )}
                    Get Suggestions
                  </Button>
                  <Button variant="outline" onClick={() => copyToClipboard(`${subject}\n\n${message}`)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All
                  </Button>
                  <Button variant="outline">
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Communication Tips */}
            {tips && (
              <Card>
                <CardHeader>
                  <CardTitle>Communication Tips</CardTitle>
                  <CardDescription>
                    Best practices for this personality type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">✓ DO</h4>
                      <div className="space-y-1">
                        {tips.dos.slice(0, 3).map((tip: string, index: number) => (
                          <p key={index} className="text-sm text-muted-foreground">
                            • {tip}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">✗ DON&apos;T</h4>
                      <div className="space-y-1">
                        {tips.donts.slice(0, 3).map((tip: string, index: number) => (
                          <p key={index} className="text-sm text-muted-foreground">
                            • {tip}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Suggestions</CardTitle>
                  <CardDescription>
                    Personalized recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/dashboard/templates">
                  <Button variant="outline" className="w-full">
                    Browse Templates
                  </Button>
                </Link>
                {profile && (
                  <Link href={`/dashboard/profiles/${profile.id}`}>
                    <Button variant="outline" className="w-full">
                      View Full Profile
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard/create-profile">
                  <Button variant="outline" className="w-full">
                    Analyze New Person
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WritingAssistant() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WritingAssistantContent />
    </Suspense>
  )
}