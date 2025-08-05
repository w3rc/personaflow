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
    // Email Templates
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
      name: 'Professional Email - S Type',
      category: 'email',
      disc_type: 'S',
      template_content: `Subject: Following up on our discussion about [TOPIC]

Dear [NAME],

I hope you're having a great week. I wanted to follow up on our conversation about [TOPIC] and share some additional thoughts.

I've taken some time to carefully consider what we discussed, and I believe [SOLUTION] could be a great fit for [COMPANY]. Here's what I'm thinking:

• [POINT_1] - This aligns well with your current processes
• [POINT_2] - It provides the stability you mentioned looking for
• [POINT_3] - Implementation would be gradual and manageable

I'd appreciate the opportunity to discuss this further when you have time. Would next week work for a brief conversation? I'm happy to work around your schedule.

Thank you for your time and consideration.

Warm regards,
[YOUR_NAME]`,
      variables: ['NAME', 'TOPIC', 'SOLUTION', 'COMPANY', 'POINT_1', 'POINT_2', 'POINT_3', 'YOUR_NAME']
    },
    {
      id: 'default-4',
      name: 'Detailed Email - C Type',
      category: 'email',
      disc_type: 'C',
      template_content: `Subject: Comprehensive analysis: [SOLUTION] for [COMPANY]

Dear [NAME],

I've completed a thorough analysis of [COMPANY]'s requirements based on our previous discussions. Please find below a detailed overview of how [SOLUTION] addresses your specific needs.

**Current Situation Analysis:**
• Challenge: [CHALLENGE_1]
• Impact: [IMPACT_1]
• Current cost: [CURRENT_COST]

**Proposed Solution Details:**
• Implementation timeline: [TIMELINE]
• Key features: [FEATURE_1], [FEATURE_2], [FEATURE_3]
• Expected ROI: [ROI_PERCENTAGE]% within [ROI_TIMEFRAME]
• Risk mitigation: [RISK_MITIGATION]

**Supporting Documentation:**
• Case study: [CASE_STUDY]
• Technical specifications: [TECH_SPECS]
• Compliance certifications: [CERTIFICATIONS]

I've attached detailed documentation for your review. I'm available to discuss any questions or concerns you may have about the technical aspects or implementation process.

Would you prefer a detailed presentation meeting or a comprehensive written proposal as the next step?

Best regards,
[YOUR_NAME]
[TITLE]
[COMPANY_NAME]`,
      variables: ['NAME', 'SOLUTION', 'COMPANY', 'CHALLENGE_1', 'IMPACT_1', 'CURRENT_COST', 'TIMELINE', 'FEATURE_1', 'FEATURE_2', 'FEATURE_3', 'ROI_PERCENTAGE', 'ROI_TIMEFRAME', 'RISK_MITIGATION', 'CASE_STUDY', 'TECH_SPECS', 'CERTIFICATIONS', 'YOUR_NAME', 'TITLE', 'COMPANY_NAME']
    },

    // Meeting Templates
    {
      id: 'default-5',
      name: 'Project Kickoff Meeting - D Type',
      category: 'meeting',
      disc_type: 'D',
      template_content: `**Meeting Purpose:** Launch [PROJECT_NAME] with clear objectives and timelines

**Agenda (45 minutes):**

1. **Project Overview** (5 min)
   - Objective: [PROJECT_OBJECTIVE]
   - Success metrics: [METRIC_1], [METRIC_2]
   - Budget: [BUDGET]

2. **Timeline & Milestones** (10 min)
   - Phase 1: [PHASE_1] - Due [DATE_1]
   - Phase 2: [PHASE_2] - Due [DATE_2]
   - Final delivery: [FINAL_DATE]

3. **Team Roles & Responsibilities** (15 min)
   - Project lead: [LEAD_NAME]
   - Key stakeholders: [STAKEHOLDER_1], [STAKEHOLDER_2]
   - Decision authority: [DECISION_MAKER]

4. **Resource Allocation** (10 min)
   - Budget breakdown
   - Team assignments
   - Tools and systems

5. **Next Steps & Action Items** (5 min)
   - Immediate actions by [DATE]
   - Next review meeting: [NEXT_MEETING_DATE]

**Key Decisions Needed:**
- [DECISION_1]
- [DECISION_2]

**Success Criteria:**
- [CRITERIA_1]
- [CRITERIA_2]`,
      variables: ['PROJECT_NAME', 'PROJECT_OBJECTIVE', 'METRIC_1', 'METRIC_2', 'BUDGET', 'PHASE_1', 'DATE_1', 'PHASE_2', 'DATE_2', 'FINAL_DATE', 'LEAD_NAME', 'STAKEHOLDER_1', 'STAKEHOLDER_2', 'DECISION_MAKER', 'DATE', 'NEXT_MEETING_DATE', 'DECISION_1', 'DECISION_2', 'CRITERIA_1', 'CRITERIA_2']
    },
    {
      id: 'default-6',
      name: 'Team Brainstorming - I Type',
      category: 'meeting',
      disc_type: 'I',
      template_content: `**Meeting Purpose:** Generate creative solutions for [CHALLENGE] through collaborative brainstorming

**Agenda (60 minutes):**

1. **Energizing Welcome** (5 min)
   - Quick wins celebration
   - Positive team updates
   - Meeting energy setting

2. **Challenge Exploration** (15 min)
   - Problem statement: [PROBLEM_STATEMENT]
   - Current impact: [CURRENT_IMPACT]
   - Ideal outcome: [IDEAL_OUTCOME]
   - Everyone shares one word describing the challenge

3. **Creative Brainstorming** (25 min)
   - Round 1: Wild ideas (no judgment!)
   - Round 2: Building on others' ideas
   - Round 3: "What if..." scenarios
   - Use sticky notes, whiteboard, mind mapping

4. **Idea Clustering & Discussion** (10 min)
   - Group similar concepts
   - Highlight most exciting ideas
   - Share enthusiasm for promising directions

5. **Next Steps & Excitement Building** (5 min)
   - Top 3 ideas to explore: [IDEA_1], [IDEA_2], [IDEA_3]
   - Volunteer ownership assignments
   - Celebration of creative energy!

**Materials Needed:**
- Whiteboard/sticky notes
- Markers
- Snacks and drinks
- Upbeat playlist

**Follow-up:**
- Share meeting photos and notes
- Schedule follow-up sessions
- Recognize contributions publicly`,
      variables: ['CHALLENGE', 'PROBLEM_STATEMENT', 'CURRENT_IMPACT', 'IDEAL_OUTCOME', 'IDEA_1', 'IDEA_2', 'IDEA_3']
    },
    {
      id: 'default-7',
      name: 'Status Review Meeting - S Type',
      category: 'meeting',
      disc_type: 'S',
      template_content: `**Meeting Purpose:** Review [PROJECT_NAME] progress and ensure team alignment

**Agenda (50 minutes):**

1. **Check-in & Comfort** (5 min)
   - How is everyone feeling about the project?
   - Any concerns or support needed?
   - Appreciation for recent contributions

2. **Progress Review** (20 min)
   - Completed milestones: [COMPLETED_1], [COMPLETED_2]
   - Current status: [CURRENT_STATUS]
   - Upcoming deliverables: [UPCOMING_1], [UPCOMING_2]
   - Timeline adherence: [TIMELINE_STATUS]

3. **Challenge Discussion** (15 min)
   - Obstacles encountered: [OBSTACLE_1]
   - Support provided: [SUPPORT_PROVIDED]
   - Team collaboration highlights
   - Process improvements implemented

4. **Team Support & Resources** (5 min)
   - Resource needs: [RESOURCE_NEED_1]
   - Training opportunities: [TRAINING_1]
   - Workload balance check

5. **Gentle Next Steps Planning** (5 min)
   - Priorities for next period: [PRIORITY_1], [PRIORITY_2]
   - Support commitments
   - Next meeting: [NEXT_MEETING_DATE]

**Team Wellness Check:**
- Workload sustainability
- Work-life balance
- Job satisfaction indicators

**Action Items:**
- [ACTION_1] - Owner: [OWNER_1] - Due: [DUE_1]
- [ACTION_2] - Owner: [OWNER_2] - Due: [DUE_2]`,
      variables: ['PROJECT_NAME', 'COMPLETED_1', 'COMPLETED_2', 'CURRENT_STATUS', 'UPCOMING_1', 'UPCOMING_2', 'TIMELINE_STATUS', 'OBSTACLE_1', 'SUPPORT_PROVIDED', 'RESOURCE_NEED_1', 'TRAINING_1', 'PRIORITY_1', 'PRIORITY_2', 'NEXT_MEETING_DATE', 'ACTION_1', 'OWNER_1', 'DUE_1', 'ACTION_2', 'OWNER_2', 'DUE_2']
    },
    {
      id: 'default-8',
      name: 'Technical Review Meeting - C Type',
      category: 'meeting',
      disc_type: 'C',
      template_content: `**Meeting Purpose:** Comprehensive technical review of [SYSTEM_NAME] with detailed analysis

**Pre-meeting Requirements:**
- Review attached technical documentation
- Prepare questions and concerns
- Bring relevant data and metrics

**Agenda (90 minutes):**

1. **Documentation Review** (20 min)
   - Technical specifications: [TECH_SPEC_VERSION]
   - Architecture overview: [ARCHITECTURE_SUMMARY]
   - Performance benchmarks: [BENCHMARK_DATA]
   - Security audit results: [SECURITY_STATUS]

2. **Detailed Technical Analysis** (30 min)
   - System performance metrics: [PERFORMANCE_METRICS]
   - Error rates and reliability: [ERROR_RATE]% 
   - Scalability assessment: [SCALABILITY_RATING]
   - Integration compatibility: [INTEGRATION_STATUS]

3. **Quality Assurance Review** (20 min)
   - Test coverage: [TEST_COVERAGE]%
   - Bug reports analysis: [BUG_COUNT] open, [CRITICAL_BUGS] critical
   - Code review findings: [CODE_REVIEW_SCORE]
   - Compliance status: [COMPLIANCE_ITEMS]

4. **Risk Assessment** (10 min)
   - Technical risks: [TECH_RISK_1], [TECH_RISK_2]
   - Mitigation strategies: [MITIGATION_1], [MITIGATION_2]
   - Contingency plans: [CONTINGENCY_PLAN]

5. **Recommendations & Action Items** (10 min)
   - Priority improvements: [IMPROVEMENT_1], [IMPROVEMENT_2]
   - Resource requirements: [RESOURCE_REQUIREMENTS]
   - Timeline for implementations: [IMPLEMENTATION_TIMELINE]

**Required Attendees:**
- Technical lead: [TECH_LEAD]
- QA manager: [QA_MANAGER]
- Security specialist: [SECURITY_SPECIALIST]

**Deliverables:**
- Technical assessment report
- Detailed action plan with timelines
- Updated risk register`,
      variables: ['SYSTEM_NAME', 'TECH_SPEC_VERSION', 'ARCHITECTURE_SUMMARY', 'BENCHMARK_DATA', 'SECURITY_STATUS', 'PERFORMANCE_METRICS', 'ERROR_RATE', 'SCALABILITY_RATING', 'INTEGRATION_STATUS', 'TEST_COVERAGE', 'BUG_COUNT', 'CRITICAL_BUGS', 'CODE_REVIEW_SCORE', 'COMPLIANCE_ITEMS', 'TECH_RISK_1', 'TECH_RISK_2', 'MITIGATION_1', 'MITIGATION_2', 'CONTINGENCY_PLAN', 'IMPROVEMENT_1', 'IMPROVEMENT_2', 'RESOURCE_REQUIREMENTS', 'IMPLEMENTATION_TIMELINE', 'TECH_LEAD', 'QA_MANAGER', 'SECURITY_SPECIALIST']
    },

    // Sales Templates
    {
      id: 'default-9',
      name: 'Sales Pitch - D Type',
      category: 'sales',
      disc_type: 'D',
      template_content: `**The Bottom Line:** [SOLUTION] will increase [COMPANY]'s [METRIC] by [PERCENTAGE]% in [TIMEFRAME].

**Executive Summary:**
• Problem: [PROBLEM_STATEMENT]
• Solution: [SOLUTION_NAME]
• Investment: [INVESTMENT_AMOUNT]
• ROI: [ROI_PERCENTAGE]% in [ROI_TIMEFRAME]
• Start date: [START_DATE]

**Competitive Advantage:**
1. [ADVANTAGE_1] - Immediate impact
2. [ADVANTAGE_2] - Market leadership
3. [ADVANTAGE_3] - Proven results

**Implementation:**
• Phase 1: [PHASE_1] - [DURATION_1]
• Phase 2: [PHASE_2] - [DURATION_2]
• Full deployment: [FULL_DEPLOYMENT_DATE]

**Success Metrics:**
• [SUCCESS_METRIC_1]: [TARGET_1]
• [SUCCESS_METRIC_2]: [TARGET_2]
• [SUCCESS_METRIC_3]: [TARGET_3]

**Next Steps:**
1. Decision by [DECISION_DATE]
2. Contract signing by [CONTRACT_DATE]
3. Project kickoff: [KICKOFF_DATE]

**Investment Details:**
• Total cost: [TOTAL_COST]
• Payment terms: [PAYMENT_TERMS]
• Warranty: [WARRANTY_PERIOD]

**Call to Action:**
Ready to move forward? Let's close this today.`,
      variables: ['SOLUTION', 'COMPANY', 'METRIC', 'PERCENTAGE', 'TIMEFRAME', 'PROBLEM_STATEMENT', 'SOLUTION_NAME', 'INVESTMENT_AMOUNT', 'ROI_PERCENTAGE', 'ROI_TIMEFRAME', 'START_DATE', 'ADVANTAGE_1', 'ADVANTAGE_2', 'ADVANTAGE_3', 'PHASE_1', 'DURATION_1', 'PHASE_2', 'DURATION_2', 'FULL_DEPLOYMENT_DATE', 'SUCCESS_METRIC_1', 'TARGET_1', 'SUCCESS_METRIC_2', 'TARGET_2', 'SUCCESS_METRIC_3', 'TARGET_3', 'DECISION_DATE', 'CONTRACT_DATE', 'KICKOFF_DATE', 'TOTAL_COST', 'PAYMENT_TERMS', 'WARRANTY_PERIOD']
    },
    {
      id: 'default-10',
      name: 'Relationship Building - I Type',
      category: 'sales',
      disc_type: 'I',
      template_content: `**Building Our Partnership for Success!**

Hi [NAME]!

I'm so excited about the opportunity to work together! After our amazing conversation, I can really see how [SOLUTION] will transform [COMPANY]'s approach to [BUSINESS_AREA].

**What I Love About This Partnership:**
🌟 Your vision for [VISION] aligns perfectly with what we do
🌟 The energy and passion your team brings is incredible
🌟 Together, we can achieve something truly remarkable!

**The Journey We'll Take Together:**
• **Discovery Phase**: Getting to know your team and culture
• **Collaborative Design**: Co-creating the perfect solution
• **Celebration Launch**: Making a big splash with your success
• **Ongoing Partnership**: Growing together long-term

**Success Stories from Similar Partnerships:**
• [CLIENT_1] achieved [RESULT_1] - they love working with us!
• [CLIENT_2] saw [RESULT_2] - their team is thriving!
• [CLIENT_3] experienced [RESULT_3] - they became industry leaders!

**What Makes This Special:**
✨ Dedicated support team who becomes part of your family
✨ Regular check-ins and celebrations of wins
✨ Continuous innovation and improvements
✨ A true partnership, not just a vendor relationship

**Investment in Our Future Together:**
• Total partnership investment: [INVESTMENT]
• Flexible payment options: [PAYMENT_OPTIONS]
• Includes ongoing support and friendship!

**Let's Celebrate This Decision!**
I can't wait to welcome [COMPANY] to our family of success stories. When can we pop the champagne and get started?

With enthusiasm and partnership,
[YOUR_NAME]

P.S. I already have some exciting ideas for our launch celebration! 🎉`,
      variables: ['NAME', 'SOLUTION', 'COMPANY', 'BUSINESS_AREA', 'VISION', 'CLIENT_1', 'RESULT_1', 'CLIENT_2', 'RESULT_2', 'CLIENT_3', 'RESULT_3', 'INVESTMENT', 'PAYMENT_OPTIONS', 'YOUR_NAME']
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