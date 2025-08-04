'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validateProfileData } from '@/lib/validation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

export default function CreateProfile() {
  const [formData, setFormData] = useState({
    targetName: '',
    targetEmail: '',
    targetLinkedin: '',
    analysisText: '',
    dataSources: [] as string[]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showLinkedInGuide, setShowLinkedInGuide] = useState(false)
  const [showContentTips, setShowContentTips] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDataSourceChange = (source: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      dataSources: checked 
        ? [...prev.dataSources, source]
        : prev.dataSources.filter(s => s !== source)
    }))
  }

  const analyzePersonality = async (text: string, userId: string) => {
    try {
      // Call our secure API route for analysis
      const response = await fetch('/api/analyze-personality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          userId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }

      const { analysis } = await response.json()
      return analysis
    } catch (error) {
      console.error('AI analysis failed, falling back to basic analysis:', error)
      
      // Fallback to basic keyword analysis if API fails
      return getBasicAnalysis(text)
    }
  }

  const getBasicAnalysis = (text: string) => {
    const words = text.toLowerCase()
    
    let dScore = 0
    let iScore = 0
    let sScore = 0
    let cScore = 0

    // Simple keyword-based scoring (fallback)
    if (words.includes('goal') || words.includes('result') || words.includes('challenge') || words.includes('direct')) dScore += 0.3
    if (words.includes('team') || words.includes('people') || words.includes('enthusiastic') || words.includes('social')) iScore += 0.3
    if (words.includes('stable') || words.includes('reliable') || words.includes('supportive') || words.includes('patient')) sScore += 0.3
    if (words.includes('detail') || words.includes('accurate') || words.includes('careful') || words.includes('analytical')) cScore += 0.3

    // Add some randomness
    dScore += Math.random() * 0.4
    iScore += Math.random() * 0.4
    sScore += Math.random() * 0.4
    cScore += Math.random() * 0.4

    const scores = { D: dScore, I: iScore, S: sScore, C: cScore }
    const primaryType = Object.keys(scores).reduce((a, b) => scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b)

    return {
      disc_type: primaryType,
      disc_scores: scores,
      confidence_score: 0.5, // Lower confidence for fallback
      personality_insights: {
        primary_type: primaryType,
        strengths: getStrengths(primaryType),
        challenges: getChallenges(primaryType),
        motivators: getMotivators(primaryType)
      },
      communication_tips: getCommunicationTips(primaryType)
    }
  }

  const getStrengths = (type: string) => {
    const strengths = {
      D: ['Direct', 'Results-oriented', 'Decisive', 'Confident'],
      I: ['Enthusiastic', 'People-oriented', 'Optimistic', 'Persuasive'],
      S: ['Patient', 'Reliable', 'Supportive', 'Good listener'],
      C: ['Analytical', 'Detailed', 'Systematic', 'Quality-focused']
    }
    return strengths[type as keyof typeof strengths] || []
  }

  const getChallenges = (type: string) => {
    const challenges = {
      D: ['Can be impatient', 'May overlook details', 'Can seem pushy'],
      I: ['May lack follow-through', 'Can be disorganized', 'May overpromise'],
      S: ['Resistant to change', 'May avoid conflict', 'Can be indecisive'],
      C: ['Can be perfectionistic', 'May overthink', 'Can seem critical']
    }
    return challenges[type as keyof typeof challenges] || []
  }

  const getMotivators = (type: string) => {
    const motivators = {
      D: ['Challenges', 'Authority', 'Results', 'Efficiency'],
      I: ['Recognition', 'Social interaction', 'Variety', 'Flexibility'],
      S: ['Security', 'Stability', 'Appreciation', 'Clear expectations'],
      C: ['Quality', 'Accuracy', 'Logic', 'Expertise']
    }
    return motivators[type as keyof typeof motivators] || []
  }

  const getCommunicationTips = (type: string) => {
    const tips = {
      D: {
        dos: ['Be direct and to the point', 'Focus on results', 'Give them control', 'Be efficient'],
        donts: ['Waste their time', 'Be overly detailed', 'Take decisions away', 'Be indecisive']
      },
      I: {
        dos: ['Be enthusiastic', 'Allow time for socializing', 'Give public recognition', 'Be optimistic'],
        donts: ['Be too serious', 'Ignore their ideas', 'Focus only on details', 'Be negative']
      },
      S: {
        dos: ['Be patient and supportive', 'Give time to process', 'Show appreciation', 'Be consistent'],
        donts: ['Rush them', 'Create sudden changes', 'Be confrontational', 'Ignore their concerns']
      },
      C: {
        dos: ['Provide details and data', 'Be logical', 'Give time to analyze', 'Be accurate'],
        donts: ['Be vague', 'Rush decisions', 'Ignore their questions', 'Be overly emotional']
      }
    }
    return tips[type as keyof typeof tips] || { dos: [], donts: [] }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate and sanitize input data
      const validation = validateProfileData({
        targetName: formData.targetName,
        targetEmail: formData.targetEmail,
        targetLinkedin: formData.targetLinkedin,
        analysisText: formData.analysisText
      })

      if (!validation.isValid) {
        setError(`Please fix the following issues: ${validation.errors.join(', ')}`)
        return
      }

      const sanitizedData = validation.sanitizedData

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to create a profile')
        return
      }

      // Check subscription limits
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('monthly_profile_limit, profiles_used')
        .eq('user_id', user.id)
        .single()

      const { data: existingProfiles } = await supabase
        .from('personality_profiles')
        .select('id')
        .eq('user_id', user.id)

      const profilesUsed = existingProfiles?.length || 0
      const limit = subscription?.monthly_profile_limit || 5

      if (profilesUsed >= limit) {
        setError('You have reached your monthly profile limit. Please upgrade your plan.')
        return
      }

      // Analyze personality with AI using sanitized text
      const analysis = await analyzePersonality(sanitizedData.analysisText, user.id)

      // Create profile
      const { data: profile, error: profileError } = await supabase
        .from('personality_profiles')
        .insert({
          user_id: user.id,
          target_name: sanitizedData.targetName,
          target_email: sanitizedData.targetEmail || null,
          target_linkedin: sanitizedData.targetLinkedin || null,
          disc_type: analysis.disc_type,
          disc_scores: analysis.disc_scores,
          personality_insights: analysis.personality_insights,
          communication_tips: analysis.communication_tips,
          confidence_score: analysis.confidence_score,
          data_sources: formData.dataSources
        })
        .select()
        .single()

      if (profileError) {
        throw profileError
      }

      // Update usage count
      await supabase
        .from('subscriptions')
        .update({ profiles_used: profilesUsed + 1 })
        .eq('user_id', user.id)

      // Log usage
      await supabase
        .from('usage_logs')
        .insert({
          user_id: user.id,
          action: 'profile_created',
          resource_id: profile.id,
          metadata: { target_name: sanitizedData.targetName }
        })

      router.push(`/dashboard/profiles/${profile.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
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

      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Personality Profile</CardTitle>
            <CardDescription>
              Analyze someone&apos;s personality to get personalized communication insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="targetName">Name *</Label>
                  <Input
                    id="targetName"
                    value={formData.targetName}
                    onChange={(e) => handleInputChange('targetName', e.target.value)}
                    placeholder="Enter the person's name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="targetEmail">Email (Optional)</Label>
                  <Input
                    id="targetEmail"
                    type="email"
                    value={formData.targetEmail}
                    onChange={(e) => handleInputChange('targetEmail', e.target.value)}
                    placeholder="Enter their email address"
                  />
                </div>

                <div>
                  <Label htmlFor="targetLinkedin">LinkedIn Profile (Optional)</Label>
                  <Input
                    id="targetLinkedin"
                    value={formData.targetLinkedin}
                    onChange={(e) => handleInputChange('targetLinkedin', e.target.value)}
                    placeholder="Enter their LinkedIn URL"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="analysisText">Text for Analysis *</Label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowLinkedInGuide(!showLinkedInGuide)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <HelpCircle className="h-4 w-4 mr-1" />
                        LinkedIn Guide
                        {showLinkedInGuide ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowContentTips(!showContentTips)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <HelpCircle className="h-4 w-4 mr-1" />
                        Content Tips
                        {showContentTips ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                      </Button>
                    </div>
                  </div>

                  {showLinkedInGuide && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3">📱 LinkedIn Content Collection Guide</h4>
                      <div className="space-y-3 text-sm text-blue-800">
                        <div>
                          <p className="font-medium">✅ Best LinkedIn Content to Copy:</p>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li><strong>About Section:</strong> Their professional summary and background</li>
                            <li><strong>Recent Posts:</strong> Original posts they&apos;ve written (not just shares)</li>
                            <li><strong>Comments:</strong> Their responses to others&apos; posts</li>
                            <li><strong>Messages:</strong> Direct LinkedIn messages if available</li>
                            <li><strong>Recommendations:</strong> Text they&apos;ve written for others</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium">💡 How to Collect:</p>
                          <ol className="list-decimal list-inside mt-1 space-y-1">
                            <li>Visit their LinkedIn profile</li>
                            <li>Copy their &quot;About&quot; section</li>
                            <li>Scroll through recent posts and copy 3-5 original posts</li>
                            <li>Look for comments they&apos;ve made on others&apos; posts</li>
                            <li>Paste all content into the text area below</li>
                          </ol>
                        </div>
                        <div className="bg-blue-100 p-2 rounded border border-blue-300">
                          <p className="font-medium">🎯 Goal: 200+ words for accurate analysis</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {showContentTips && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-3">💎 Content Quality Tips</h4>
                      <div className="space-y-3 text-sm text-green-800">
                        <div>
                          <p className="font-medium">🟢 Great for Analysis:</p>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Original writing (not quotes or reposts)</li>
                            <li>Casual conversation or personal opinions</li>
                            <li>Email communication or messages</li>
                            <li>Meeting notes or feedback they&apos;ve written</li>
                            <li>Social media posts expressing their views</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium">🔴 Less Effective:</p>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Formal business documents or legal text</li>
                            <li>Copy-pasted content or quotes</li>
                            <li>Very short messages (&quot;Thanks!&quot; &quot;Agreed&quot;)</li>
                            <li>Technical documentation</li>
                          </ul>
                        </div>
                        <div className="bg-green-100 p-2 rounded border border-green-300">
                          <p className="font-medium">✨ Mix different types of content for best results!</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Textarea
                    id="analysisText"
                    value={formData.analysisText}
                    onChange={(e) => handleInputChange('analysisText', e.target.value)}
                    placeholder="Paste LinkedIn posts, emails, messages, or other written communication from this person. The more varied content, the better the analysis will be."
                    className="min-h-[200px]"
                    required
                  />
                  <div className="flex justify-between mt-2">
                    <p className="text-sm text-muted-foreground">
                      💡 Pro tip: Mix LinkedIn posts, emails, and casual messages for the most accurate personality analysis.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formData.analysisText.length} characters
                      {formData.analysisText.length < 200 && (
                        <span className="text-orange-600 ml-2">
                          (Need 200+ for better accuracy)
                        </span>
                      )}
                      {formData.analysisText.length >= 200 && formData.analysisText.length < 500 && (
                        <span className="text-yellow-600 ml-2">
                          (Good - more text = better analysis)
                        </span>
                      )}
                      {formData.analysisText.length >= 500 && (
                        <span className="text-green-600 ml-2">
                          (Excellent length for analysis!)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <Label>Data Sources Used</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select all sources you used to gather content for analysis:
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { id: 'LinkedIn Posts', label: 'LinkedIn Posts', desc: 'Original posts they wrote' },
                      { id: 'LinkedIn About', label: 'LinkedIn About', desc: 'Profile summary section' },
                      { id: 'LinkedIn Comments', label: 'LinkedIn Comments', desc: 'Comments on others\' posts' },
                      { id: 'LinkedIn Messages', label: 'LinkedIn Messages', desc: 'Direct messages' },
                      { id: 'Email', label: 'Email', desc: 'Email communication' },
                      { id: 'Meeting Notes', label: 'Meeting Notes', desc: 'Written meeting content' },
                      { id: 'Social Media', label: 'Other Social Media', desc: 'Twitter, Facebook, etc.' },
                      { id: 'Other', label: 'Other Sources', desc: 'Documents, chat, etc.' }
                    ].map((source) => (
                      <label key={source.id} className="flex items-start space-x-2 p-2 border rounded hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={formData.dataSources.includes(source.id)}
                          onChange={(e) => handleDataSourceChange(source.id, e.target.checked)}
                          className="rounded border-gray-300 mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium block">{source.label}</span>
                          <span className="text-xs text-muted-foreground">{source.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Analyzing with AI...' : 'Create Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}