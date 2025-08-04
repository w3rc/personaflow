import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Mail, Linkedin, Calendar, TrendingUp } from 'lucide-react'

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile, error } = await supabase
    .from('personality_profiles')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !profile) {
    notFound()
  }

  const discTypes = {
    D: {
      name: 'Dominance',
      description: 'Direct, results-oriented, firm, strong-willed, and forceful',
      color: 'bg-red-100 text-red-800 border-red-200'
    },
    I: {
      name: 'Influence',
      description: 'Outgoing, enthusiastic, optimistic, high-spirited, and lively',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    S: {
      name: 'Steadiness',
      description: 'Even-tempered, accommodating, patient, humble, and tactful',
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    C: {
      name: 'Conscientiousness',
      description: 'Private, analytical, logical, critical thinker, and reserved',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const primaryType = discTypes[profile.disc_type as keyof typeof discTypes]
  const insights = profile.personality_insights
  const tips = profile.communication_tips

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

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{profile.target_name}</h1>
              <div className="flex items-center space-x-4 mt-2 text-muted-foreground">
                {profile.target_email && (
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{profile.target_email}</span>
                  </div>
                )}
                {profile.target_linkedin && (
                  <div className="flex items-center space-x-1">
                    <Linkedin className="h-4 w-4" />
                    <span className="text-sm">LinkedIn Profile</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    Created {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {Math.round(profile.confidence_score * 100)}% Confidence
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* DISC Type */}
          <Card>
            <CardHeader>
              <CardTitle>Primary DISC Type</CardTitle>
              <CardDescription>Dominant personality characteristic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${primaryType.color}`}>
                {profile.disc_type} - {primaryType.name}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                {primaryType.description}
              </p>
            </CardContent>
          </Card>

          {/* DISC Scores */}
          <Card>
            <CardHeader>
              <CardTitle>DISC Breakdown</CardTitle>
              <CardDescription>Detailed personality scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(profile.disc_scores).map(([type, score]) => (
                  <div key={type} className="flex items-center space-x-3">
                    <div className="w-8 text-sm font-medium">{type}</div>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.round((score as number) * 100)}%` }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground w-12">
                      {Math.round((score as number) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle>Key Strengths</CardTitle>
              <CardDescription>Natural talents and abilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.strengths.map((strength: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">{strength}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Challenges */}
          <Card>
            <CardHeader>
              <CardTitle>Potential Challenges</CardTitle>
              <CardDescription>Areas that may need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.challenges.map((challenge: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span className="text-sm">{challenge}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Motivators */}
          <Card>
            <CardHeader>
              <CardTitle>Key Motivators</CardTitle>
              <CardDescription>What drives and energizes them</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.motivators.map((motivator: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm">{motivator}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Sources</CardTitle>
              <CardDescription>Data used for this analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.data_sources?.map((source: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Communication Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Communication Guidelines</CardTitle>
            <CardDescription>How to communicate effectively with {profile.target_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-700 mb-3">✓ DO</h4>
                <div className="space-y-2">
                  {tips.dos.map((tip: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-red-700 mb-3">✗ DON&apos;T</h4>
                <div className="space-y-2">
                  {tips.donts.map((tip: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex space-x-4">
          <Link href={`/dashboard/writing-assistant?profile=${profile.id}`}>
            <Button>
              Use Writing Assistant
            </Button>
          </Link>
          <Link href="/dashboard/templates">
            <Button variant="outline">
              Browse Templates
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}