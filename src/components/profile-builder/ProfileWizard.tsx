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
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Loader2, CheckCircle, Users, FileText, Target } from 'lucide-react'
import { ProfileTemplateSelector } from './ProfileTemplateSelector'
import { ContentSuggestions } from './ContentSuggestions'
import { ProfilePreview } from './ProfilePreview'

export interface ProfileFormData {
  targetName: string
  targetEmail: string
  targetLinkedin: string
  analysisText: string
  dataSources: string[]
  template?: string
  scenario?: string
}

const steps = [
  { id: 1, title: 'Choose Template', icon: Target, description: 'Select a profile type' },
  { id: 2, title: 'Basic Info', icon: Users, description: 'Add contact details' },
  { id: 3, title: 'Content', icon: FileText, description: 'Provide analysis text' },
  { id: 4, title: 'Review', icon: CheckCircle, description: 'Verify and create' }
]

interface ProfileWizardProps {
  onComplete?: (profileId: string) => void
}

export function ProfileWizard({ onComplete }: ProfileWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ProfileFormData>({
    targetName: '',
    targetEmail: '',
    targetLinkedin: '',
    analysisText: '',
    dataSources: [],
    template: '',
    scenario: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const progress = (currentStep / steps.length) * 100

  const handleInputChange = (field: keyof ProfileFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateCurrentStep = (): string | null => {
    switch (currentStep) {
      case 1:
        if (!formData.template) return 'Please select a profile template'
        break
      case 2:
        if (!formData.targetName.trim()) return 'Name is required'
        if (formData.targetEmail && !/\S+@\S+\.\S+/.test(formData.targetEmail)) {
          return 'Please enter a valid email address'
        }
        break
      case 3:
        if (!formData.analysisText.trim()) return 'Analysis text is required'
        if (formData.analysisText.length < 50) return 'Please provide at least 50 characters of text for analysis'
        break
    }
    return null
  }

  const nextStep = () => {
    const validationError = validateCurrentStep()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    setError('')
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const analyzePersonality = async (text: string, userId: string) => {
    try {
      const response = await fetch('/api/analyze-personality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          userId,
          template: formData.template,
          scenario: formData.scenario
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
      return getBasicAnalysis(text)
    }
  }

  const getBasicAnalysis = (text: string) => {
    const words = text.toLowerCase()
    
    let dScore = 0
    let iScore = 0
    let sScore = 0
    let cScore = 0

    // Simple keyword-based scoring
    if (words.includes('goal') || words.includes('result') || words.includes('challenge') || words.includes('direct')) dScore += 0.3
    if (words.includes('team') || words.includes('people') || words.includes('enthusiastic') || words.includes('social')) iScore += 0.3
    if (words.includes('stable') || words.includes('reliable') || words.includes('supportive') || words.includes('patient')) sScore += 0.3
    if (words.includes('detail') || words.includes('accurate') || words.includes('careful') || words.includes('analytical')) cScore += 0.3

    dScore += Math.random() * 0.4
    iScore += Math.random() * 0.4
    sScore += Math.random() * 0.4
    cScore += Math.random() * 0.4

    const scores = { D: dScore, I: iScore, S: sScore, C: cScore }
    const primaryType = Object.keys(scores).reduce((a, b) => scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b)

    return {
      disc_type: primaryType,
      disc_scores: scores,
      confidence_score: 0.6,
      personality_insights: {
        primary_type: primaryType,
        template_used: formData.template,
        scenario: formData.scenario
      },
      communication_tips: { dos: [], donts: [] }
    }
  }

  const handleSubmit = async () => {
    const validationError = validateCurrentStep()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')

    try {
      const validation = validateProfileData({
        targetName: formData.targetName,
        targetEmail: formData.targetEmail,
        targetLinkedin: formData.targetLinkedin,
        analysisText: formData.analysisText
      })

      if (!validation.isValid) {
        setError(`Please fix: ${validation.errors.join(', ')}`)
        return
      }

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

      const analysis = await analyzePersonality(validation.sanitizedData.analysisText, user.id)

      const { data: profile, error: profileError } = await supabase
        .from('personality_profiles')
        .insert({
          user_id: user.id,
          target_name: validation.sanitizedData.targetName,
          target_email: validation.sanitizedData.targetEmail || null,
          target_linkedin: validation.sanitizedData.targetLinkedin || null,
          disc_type: analysis.disc_type,
          disc_scores: analysis.disc_scores,
          personality_insights: {
            ...analysis.personality_insights,
            template_used: formData.template,
            scenario: formData.scenario
          },
          communication_tips: analysis.communication_tips,
          confidence_score: analysis.confidence_score,
          data_sources: formData.dataSources
        })
        .select()
        .single()

      if (profileError) {
        throw profileError
      }

      await supabase
        .from('subscriptions')
        .update({ profiles_used: profilesUsed + 1 })
        .eq('user_id', user.id)

      await supabase
        .from('usage_logs')
        .insert({
          user_id: user.id,
          action: 'profile_created',
          resource_id: profile.id,
          metadata: { 
            target_name: validation.sanitizedData.targetName,
            template_used: formData.template,
            scenario: formData.scenario
          }
        })

      if (onComplete) {
        onComplete(profile.id)
      } else {
        router.push(`/dashboard/profiles/${profile.id}`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProfileTemplateSelector
            selectedTemplate={formData.template}
            selectedScenario={formData.scenario}
            onTemplateChange={(template, scenario) => {
              handleInputChange('template', template)
              handleInputChange('scenario', scenario || '')
            }}
          />
        )
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="targetName">Full Name *</Label>
              <Input
                id="targetName"
                value={formData.targetName}
                onChange={(e) => handleInputChange('targetName', e.target.value)}
                placeholder="Enter the person's full name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="targetEmail">Email Address (Optional)</Label>
              <Input
                id="targetEmail"
                type="email"
                value={formData.targetEmail}
                onChange={(e) => handleInputChange('targetEmail', e.target.value)}
                placeholder="their.email@company.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="targetLinkedin">LinkedIn Profile (Optional)</Label>
              <Input
                id="targetLinkedin"
                value={formData.targetLinkedin}
                onChange={(e) => handleInputChange('targetLinkedin', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="mt-1"
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <ContentSuggestions 
              template={formData.template}
              scenario={formData.scenario}
              onContentChange={(content) => handleInputChange('analysisText', content)}
              onDataSourcesChange={(sources) => handleInputChange('dataSources', sources)}
            />
            <div>
              <Label htmlFor="analysisText">Content for Analysis *</Label>
              <Textarea
                id="analysisText"
                value={formData.analysisText}
                onChange={(e) => handleInputChange('analysisText', e.target.value)}
                placeholder="Paste content here..."
                className="min-h-[200px] mt-1"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>
                  {formData.analysisText.length < 50 && '⚠️ Need at least 50 characters'}
                  {formData.analysisText.length >= 50 && formData.analysisText.length < 200 && '✅ Good start - more text = better analysis'}
                  {formData.analysisText.length >= 200 && '🎯 Excellent length for analysis!'}
                </span>
                <span>{formData.analysisText.length} characters</span>
              </div>
            </div>
          </div>
        )
      case 4:
        return (
          <ProfilePreview 
            formData={formData}
            onEdit={(step) => setCurrentStep(step)}
          />
        )
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create New Profile</CardTitle>
              <CardDescription>
                Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.description}
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step Navigation */}
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className={`flex items-center space-x-2 ${
                  isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                }`}>
                  <div className={`rounded-full p-2 ${
                    isActive ? 'bg-primary text-primary-foreground' : 
                    isCompleted ? 'bg-green-100 text-green-600' : 'bg-muted'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                </div>
              )
            })}
          </div>

          {error && (
            <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button onClick={nextStep} disabled={loading}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {loading ? 'Creating Profile...' : 'Create Profile'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}