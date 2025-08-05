'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Edit, 
  User, 
  Mail, 
  ExternalLink, 
  FileText, 
  Target,
  AlertCircle
} from 'lucide-react'
import type { ProfileFormData } from './ProfileWizard'

interface ProfilePreviewProps {
  formData: ProfileFormData
  onEdit: (step: number) => void
}

export function ProfilePreview({ formData, onEdit }: ProfilePreviewProps) {
  const getTemplateDisplayName = (template: string) => {
    const templates = {
      colleague: 'Work Colleague',
      client: 'Client/Customer', 
      prospect: 'Sales Prospect',
      manager: 'Manager/Boss',
      'team-member': 'Team Member',
      personal: 'Personal Contact'
    }
    return templates[template as keyof typeof templates] || template
  }

  const getScenarioDisplayName = (scenario: string) => {
    const scenarios: Record<string, string> = {
      'daily-collaboration': 'Daily Collaboration',
      'project-partner': 'Project Partner',
      'cross-team': 'Cross-team Work',
      'new-client': 'New Client',
      'existing-client': 'Existing Client',
      'difficult-client': 'Challenging Client',
      'cold-outreach': 'Cold Outreach',
      'warm-lead': 'Warm Lead',
      'decision-maker': 'Decision Maker',
      'new-manager': 'New Manager',
      'performance-review': 'Performance Review',
      'project-approval': 'Project Approval',
      'new-hire': 'New Team Member',
      'mentoring': 'Mentoring',
      'performance-coaching': 'Performance Coaching',
      'family-member': 'Family Member',
      'close-friend': 'Close Friend',
      'romantic-partner': 'Romantic Partner'
    }
    return scenarios[scenario] || scenario
  }

  const getContentQuality = () => {
    const length = formData.analysisText.length
    if (length < 100) return { status: 'poor', message: 'Very short - analysis may be limited', color: 'text-red-600' }
    if (length < 200) return { status: 'fair', message: 'Good start - more content = better analysis', color: 'text-yellow-600' }
    if (length < 500) return { status: 'good', message: 'Good length for analysis', color: 'text-blue-600' }
    return { status: 'excellent', message: 'Excellent length for detailed analysis', color: 'text-green-600' }
  }

  const contentQuality = getContentQuality()

  const warnings = []
  if (!formData.targetName.trim()) warnings.push('Name is required')
  if (!formData.analysisText.trim()) warnings.push('Analysis text is required')
  if (formData.analysisText.length < 50) warnings.push('Analysis text is too short')
  if (formData.targetEmail && !/\S+@\S+\.\S+/.test(formData.targetEmail)) warnings.push('Invalid email format')

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review Profile Details</h3>
        <p className="text-muted-foreground">
          Please review all information before creating the profile. You can edit any section by clicking the edit button.
        </p>
      </div>

      {warnings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Please fix the following issues:</h4>
              <ul className="mt-2 text-sm text-red-700 space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Profile Type */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Profile Type</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Badge variant="secondary" className="text-sm">
              {getTemplateDisplayName(formData.template || '')}
            </Badge>
            {formData.scenario && (
              <div className="text-sm text-muted-foreground">
                Scenario: {getScenarioDisplayName(formData.scenario)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Basic Information</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Name</label>
            <p className="text-sm">{formData.targetName || 'Not provided'}</p>
          </div>
          
          {formData.targetEmail && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{formData.targetEmail}</p>
              </div>
            </div>
          )}
          
          {formData.targetLinkedin && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">LinkedIn</label>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm truncate">{formData.targetLinkedin}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Content for Analysis</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Content Quality</label>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className={contentQuality.color}>
                {contentQuality.status.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formData.analysisText.length} characters
              </span>
            </div>
            <p className={`text-sm mt-1 ${contentQuality.color}`}>
              {contentQuality.message}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Text Preview</label>
            <div className="mt-1 p-3 bg-muted/50 rounded-lg max-h-32 overflow-y-auto">
              <p className="text-sm font-mono text-muted-foreground">
                {formData.analysisText ? 
                  formData.analysisText.substring(0, 200) + (formData.analysisText.length > 200 ? '...' : '') :
                  'No content provided'
                }
              </p>
            </div>
          </div>

          {formData.dataSources.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data Sources</label>
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.dataSources.map((source) => (
                  <Badge key={source} variant="outline" className="text-xs">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">What You&apos;ll Get</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-sm mb-2">🎯 DISC Personality Type</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Primary and secondary personality traits with confidence scores
              </p>
              
              <h4 className="font-medium text-sm mb-2">💡 Communication Tips</h4>
              <p className="text-xs text-muted-foreground">
                Specific do&apos;s and don&apos;ts for communicating with this person
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">🎪 Personality Insights</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Strengths, challenges, and motivational factors
              </p>
              
              <h4 className="font-medium text-sm mb-2">📧 Template Recommendations</h4>
              <p className="text-xs text-muted-foreground">
                Personalized email and message templates
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Confirmation */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <div className="text-green-600 text-lg">✨</div>
          <div>
            <h4 className="font-medium text-green-800">Ready to Create Profile</h4>
            <p className="text-sm text-green-700 mt-1">
              Your profile will be analyzed using AI to provide personalized communication insights.
              This typically takes 10-30 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}