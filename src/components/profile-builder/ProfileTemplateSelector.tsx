'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Briefcase, 
  Users, 
  MessageSquare, 
  Handshake, 
  Target, 
  Heart, 
  GraduationCap,
  Building
} from 'lucide-react'

const templates = [
  {
    id: 'colleague',
    title: 'Work Colleague',
    description: 'Analyze a current or former coworker for better collaboration',
    icon: Users,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    scenarios: [
      { id: 'daily-collaboration', name: 'Daily Collaboration', description: 'Regular team work and meetings' },
      { id: 'project-partner', name: 'Project Partner', description: 'Specific project collaboration' },
      { id: 'cross-team', name: 'Cross-team Work', description: 'Working with other departments' }
    ],
    contentSuggestions: [
      'Slack/Teams messages and conversations',
      'Email exchanges about projects',
      'Meeting notes and contributions',
      'Feedback they\'ve given or received',
      'Their professional summary or bio'
    ]
  },
  {
    id: 'client',
    title: 'Client/Customer',
    description: 'Understand clients better for improved service and communication',
    icon: Handshake,
    color: 'bg-green-50 border-green-200 text-green-700',
    scenarios: [
      { id: 'new-client', name: 'New Client', description: 'Recently acquired client relationship' },
      { id: 'existing-client', name: 'Existing Client', description: 'Long-term client relationship' },
      { id: 'difficult-client', name: 'Challenging Client', description: 'Improve difficult relationships' }
    ],
    contentSuggestions: [
      'Email communications about services',
      'Meeting transcripts or notes',
      'Feedback and reviews they\'ve provided',
      'LinkedIn posts and professional content',
      'Any written testimonials or case studies'
    ]
  },
  {
    id: 'prospect',
    title: 'Sales Prospect',
    description: 'Tailor your sales approach to potential customers',
    icon: Target,
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    scenarios: [
      { id: 'cold-outreach', name: 'Cold Outreach', description: 'Initial contact and introduction' },
      { id: 'warm-lead', name: 'Warm Lead', description: 'Referred or engaged prospect' },
      { id: 'decision-maker', name: 'Decision Maker', description: 'Key stakeholder in buying process' }
    ],
    contentSuggestions: [
      'LinkedIn profile and recent posts',
      'Company communications or press releases',
      'Industry articles they\'ve written or shared',
      'Social media posts (professional)',
      'Public speaking or interview transcripts'
    ]
  },
  {
    id: 'manager',
    title: 'Manager/Boss',
    description: 'Better understand your manager\'s communication style',
    icon: Briefcase,
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    scenarios: [
      { id: 'new-manager', name: 'New Manager', description: 'Recently assigned or hired manager' },
      { id: 'performance-review', name: 'Performance Review', description: 'Preparing for review discussions' },
      { id: 'project-approval', name: 'Project Approval', description: 'Seeking buy-in for initiatives' }
    ],
    contentSuggestions: [
      'Email communications and feedback',
      'Meeting notes and directives',
      'Slack/Teams messages',
      'Performance review comments',
      'Their LinkedIn posts about leadership'
    ]
  },
  {
    id: 'team-member',
    title: 'Team Member',
    description: 'Understand direct reports or team members better',
    icon: Users,
    color: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    scenarios: [
      { id: 'new-hire', name: 'New Team Member', description: 'Recently joined team member' },
      { id: 'mentoring', name: 'Mentoring', description: 'Providing guidance and support' },
      { id: 'performance-coaching', name: 'Performance Coaching', description: 'Improving team performance' }
    ],
    contentSuggestions: [
      'Work communications and updates',
      'Project contributions and ideas',
      '1:1 meeting notes and discussions',
      'Professional development goals',
      'Feedback and self-assessments'
    ]
  },
  {
    id: 'personal',
    title: 'Personal Contact',
    description: 'Improve communication with friends, family, or personal contacts',
    icon: Heart,
    color: 'bg-pink-50 border-pink-200 text-pink-700',
    scenarios: [
      { id: 'family-member', name: 'Family Member', description: 'Better family relationships' },
      { id: 'close-friend', name: 'Close Friend', description: 'Deepen friendship understanding' },
      { id: 'romantic-partner', name: 'Romantic Partner', description: 'Improve relationship communication' }
    ],
    contentSuggestions: [
      'Text message conversations',
      'Social media posts and comments',
      'Email or written communications',
      'Shared experiences and stories',
      'Personal letters or notes they\'ve written'
    ]
  }
]

interface ProfileTemplateSelectorProps {
  selectedTemplate?: string
  selectedScenario?: string
  onTemplateChange: (template: string, scenario?: string) => void
}

export function ProfileTemplateSelector({ 
  selectedTemplate, 
  selectedScenario, 
  onTemplateChange 
}: ProfileTemplateSelectorProps) {
  const selectedTemplateData = templates.find(t => t.id === selectedTemplate)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Profile Type</h3>
        <p className="text-muted-foreground mb-4">
          Select the category that best describes your relationship with this person. 
          This helps us provide more relevant analysis and communication suggestions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((template) => {
          const Icon = template.icon
          const isSelected = selectedTemplate === template.id
          
          return (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary shadow-md' : ''
              }`}
              onClick={() => onTemplateChange(template.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start space-x-3">
                  <div className={`rounded-lg p-2 ${template.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{template.title}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {template.description}
                    </CardDescription>
                  </div>
                  {isSelected && (
                    <Badge variant="default" className="ml-2">
                      Selected
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {/* Scenario Selection */}
      {selectedTemplateData && (
        <div className="space-y-4 pt-4 border-t">
          <div>
            <h4 className="font-medium mb-2">Select Scenario (Optional)</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Choose a specific scenario to get more targeted communication advice.
            </p>
          </div>
          
          <div className="grid gap-2 md:grid-cols-2">
            {selectedTemplateData.scenarios.map((scenario) => (
              <Button
                key={scenario.id}
                variant={selectedScenario === scenario.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTemplateChange(selectedTemplate!, scenario.id)}
                className="justify-start h-auto p-3 text-left"
              >
                <div>
                  <div className="font-medium">{scenario.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {scenario.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Content Suggestions Preview */}
      {selectedTemplateData && (
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium">💡 Content Suggestions for {selectedTemplateData.title}</h4>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">
              For the best analysis results, try to include:
            </p>
            <ul className="text-sm space-y-1">
              {selectedTemplateData.contentSuggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}