import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, Mail, MessageSquare, Phone, FileText } from 'lucide-react'

export default async function TemplatesPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's custom templates
  const { data: userTemplates } = await supabase
    .from('communication_templates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Default templates (these would typically be seeded in the database)
  const defaultTemplates = [
    {
      id: 'default-1',
      name: 'Cold Email - D Type',
      category: 'email',
      disc_type: 'D',
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
      variables: ['NAME', 'COMPANY', 'METRIC', 'PERCENTAGE', 'TIMEFRAME', 'BENEFIT_1', 'BENEFIT_2', 'BENEFIT_3', 'YOUR_NAME']
    },
    {
      id: 'default-2',
      name: 'Follow-up Email - I Type',
      category: 'email',
      disc_type: 'I',
      template_content: `Subject: Great meeting you at [EVENT]! 🎉

Hi [NAME]!

It was fantastic meeting you at [EVENT] yesterday! I really enjoyed our conversation about [TOPIC] - your insights were incredibly valuable.

As promised, I'm attaching [RESOURCE] that we discussed. I think you'll find it really helpful for [USE_CASE].

I'd love to continue our conversation over coffee sometime. Are you free next week for a quick chat? I have some exciting ideas I'd love to share with you!

Looking forward to hearing from you!

Cheers,
[YOUR_NAME]

P.S. Congratulations again on [ACHIEVEMENT]! 🎊`,
      variables: ['NAME', 'EVENT', 'TOPIC', 'RESOURCE', 'USE_CASE', 'ACHIEVEMENT', 'YOUR_NAME']
    },
    {
      id: 'default-3',
      name: 'Project Update - S Type',
      category: 'email',
      disc_type: 'S',
      template_content: `Subject: Steady progress on [PROJECT_NAME] - Update #[NUMBER]

Dear [NAME],

I hope this email finds you well. I wanted to provide you with a comprehensive update on our [PROJECT_NAME] project.

Current Status:
✅ Completed: [COMPLETED_ITEMS]
🔄 In Progress: [IN_PROGRESS_ITEMS]
📅 Upcoming: [UPCOMING_ITEMS]

We're maintaining our timeline and quality standards. I've been working closely with the team to ensure we address any concerns promptly.

If you have any questions or need clarification on any aspect, please don't hesitate to reach out. I'm here to support you throughout this process.

Thank you for your continued trust and patience.

Best regards,
[YOUR_NAME]`,
      variables: ['PROJECT_NAME', 'NUMBER', 'NAME', 'COMPLETED_ITEMS', 'IN_PROGRESS_ITEMS', 'UPCOMING_ITEMS', 'YOUR_NAME']
    },
    {
      id: 'default-4',
      name: 'Detailed Proposal - C Type',
      category: 'email',
      disc_type: 'C',
      template_content: `Subject: Comprehensive Analysis: [SOLUTION] for [COMPANY]

Dear [NAME],

Following our initial discussion, I've conducted a thorough analysis of [COMPANY]'s requirements. Please find below a detailed breakdown of our proposed solution.

Executive Summary:
Our analysis indicates that implementing [SOLUTION] will result in:
• ROI: [ROI_PERCENTAGE]% within [TIMEFRAME]
• Cost savings: $[AMOUNT] annually
• Efficiency improvement: [EFFICIENCY]%

Detailed Methodology:
1. [STEP_1_DESCRIPTION]
2. [STEP_2_DESCRIPTION]
3. [STEP_3_DESCRIPTION]

Risk Assessment:
• Low risk: [LOW_RISKS]
• Medium risk: [MEDIUM_RISKS]
• Mitigation strategies: [MITIGATION]

I've attached the complete 15-page analysis document with supporting data, case studies, and implementation timeline.

Please review and let me know if you need any additional information or clarification on our methodology.

Respectfully,
[YOUR_NAME]

Attachments: [DOCUMENT_LIST]`,
      variables: ['SOLUTION', 'COMPANY', 'NAME', 'ROI_PERCENTAGE', 'TIMEFRAME', 'AMOUNT', 'EFFICIENCY', 'STEP_1_DESCRIPTION', 'STEP_2_DESCRIPTION', 'STEP_3_DESCRIPTION', 'LOW_RISKS', 'MEDIUM_RISKS', 'MITIGATION', 'YOUR_NAME', 'DOCUMENT_LIST']
    },
    {
      id: 'default-5',
      name: 'Meeting Request - D Type',
      category: 'meeting',
      disc_type: 'D',
      template_content: `Subject: 15-min strategic discussion - [TOPIC]

[NAME],

I need 15 minutes of your time to discuss [TOPIC]. This directly impacts [BUSINESS_IMPACT].

Agenda:
1. Current challenge (3 min)
2. Proposed solution (7 min)
3. Next steps (5 min)

Available slots:
• [TIME_SLOT_1]
• [TIME_SLOT_2]
• [TIME_SLOT_3]

Which works for you?

[YOUR_NAME]`,
      variables: ['NAME', 'TOPIC', 'BUSINESS_IMPACT', 'TIME_SLOT_1', 'TIME_SLOT_2', 'TIME_SLOT_3', 'YOUR_NAME']
    },
    {
      id: 'default-6',
      name: 'Team Collaboration - I Type',
      category: 'meeting',
      disc_type: 'I',
      template_content: `Subject: Let's brainstorm together! 🧠✨ - [PROJECT] kickoff

Hey [NAME]!

I'm super excited to kick off the [PROJECT] project with you and the team! 

I think we could create something really amazing together. Your expertise in [EXPERTISE_AREA] would be invaluable for this initiative.

Meeting Details:
📅 When: [DATE] at [TIME]
📍 Where: [LOCATION/ZOOM_LINK]
⏰ Duration: [DURATION]

Agenda (but let's keep it flexible!):
• Quick introductions and team energy check
• Vision sharing and brainstorming session
• Ideas collaboration 
• Celebrate our awesome team! 🎉

Can't wait to see what we create together!

Cheers,
[YOUR_NAME]`,
      variables: ['NAME', 'PROJECT', 'EXPERTISE_AREA', 'DATE', 'TIME', 'LOCATION', 'DURATION', 'YOUR_NAME']
    }
  ]

  const allTemplates = [...defaultTemplates, ...(userTemplates || [])]

  const categories = [
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'meeting', name: 'Meeting', icon: MessageSquare },
    { id: 'sales', name: 'Sales', icon: Phone },
    { id: 'other', name: 'Other', icon: FileText }
  ]

  const discTypes = [
    { id: 'D', name: 'Dominance', color: 'bg-red-100 text-red-800' },
    { id: 'I', name: 'Influence', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'S', name: 'Steadiness', color: 'bg-green-100 text-green-800' },
    { id: 'C', name: 'Conscientiousness', color: 'bg-blue-100 text-blue-800' },
    { id: 'ALL', name: 'All Types', color: 'bg-gray-100 text-gray-800' }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="ml-auto">
            <Link href="/dashboard/templates/create">
              <Button>Create Template</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Communication Templates</h1>
          <p className="text-muted-foreground mt-2">
            Pre-built templates optimized for different personality types
          </p>
        </div>

        {/* Filter by Category */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Browse by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const Icon = category.icon
              const count = allTemplates.filter(t => t.category === category.id).length
              return (
                <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <Icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">{count} templates</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryTemplates = allTemplates.filter(t => t.category === category.id)
            if (categoryTemplates.length === 0) return null

            return (
              <div key={category.id}>
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <category.icon className="h-5 w-5" />
                  <span>{category.name} Templates</span>
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryTemplates.map((template) => {
                    const discType = discTypes.find(d => d.id === template.disc_type)
                    return (
                      <Card key={template.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            {discType && (
                              <Badge variant="secondary" className={discType.color}>
                                {discType.name}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="line-clamp-3 mb-4">
                            {template.template_content.substring(0, 150)}...
                          </CardDescription>
                          <div className="flex space-x-2">
                            <Link href={`/dashboard/templates/${template.id}`}>
                              <Button size="sm">View Template</Button>
                            </Link>
                            <Link href={`/dashboard/writing-assistant?template=${template.id}`}>
                              <Button variant="outline" size="sm">Use Template</Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Custom Templates */}
        {userTemplates && userTemplates.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Your Custom Templates</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userTemplates.map((template) => {
                const discType = discTypes.find(d => d.id === template.disc_type)
                return (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {discType && (
                          <Badge variant="secondary" className={discType.color}>
                            {discType.name}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-3 mb-4">
                        {template.template_content.substring(0, 150)}...
                      </CardDescription>
                      <div className="flex space-x-2">
                        <Link href={`/dashboard/templates/${template.id}`}>
                          <Button size="sm">Edit Template</Button>
                        </Link>
                        <Link href={`/dashboard/writing-assistant?template=${template.id}`}>
                          <Button variant="outline" size="sm">Use Template</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}