import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, FileText, TrendingUp, Plus } from 'lucide-react'

export default async function Dashboard() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user data
  const [profilesResult, subscriptionResult] = await Promise.all([
    supabase
      .from('personality_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()
  ])

  const profiles = profilesResult.data || []
  const subscription = subscriptionResult.data

  const profilesUsed = profiles.length
  const profileLimit = subscription?.monthly_profile_limit || 5
  const remainingProfiles = profileLimit - profilesUsed

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Crystal Knows Clone</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welcome, {user.email}</span>
            <form action="/auth/signout" method="post">
              <Button variant="outline" size="sm" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profilesUsed}</div>
              <p className="text-xs text-muted-foreground">
                {remainingProfiles} remaining this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Available templates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{subscription?.plan_name || 'Free'}</div>
              <p className="text-xs text-muted-foreground">{profileLimit} profiles/month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usage</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round((profilesUsed / profileLimit) * 100)}%</div>
              <p className="text-xs text-muted-foreground">Of monthly limit</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Create New Profile</CardTitle>
              <CardDescription>
                Analyze someone&apos;s personality to improve your communication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/create-profile">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Communication Templates</CardTitle>
              <CardDescription>
                Browse templates optimized for different personality types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/templates">
                <Button variant="outline" className="w-full">
                  View Templates
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Writing Assistant</CardTitle>
              <CardDescription>
                Get personalized suggestions for your messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/writing-assistant">
                <Button variant="outline" className="w-full">
                  Start Writing
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Profiles */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Profiles</CardTitle>
              <CardDescription>Your latest personality analyses</CardDescription>
            </CardHeader>
            <CardContent>
              {profiles.length > 0 ? (
                <div className="space-y-4">
                  {profiles.slice(0, 5).map((profile) => (
                    <div key={profile.id} className="flex items-center space-x-4">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {profile.target_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {profile.disc_type ? `DISC: ${profile.disc_type}` : 'Analysis pending'}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {profiles.length > 5 && (
                    <Link href="/dashboard/profiles">
                      <Button variant="ghost" className="w-full">
                        View All Profiles
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No profiles created yet</p>
                  <Link href="/dashboard/create-profile">
                    <Button className="mt-2">Create Your First Profile</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Usage This Month</CardTitle>
              <CardDescription>Track your subscription usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Profiles Created</span>
                    <span>{profilesUsed}/{profileLimit}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div
                      className="h-2 bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min((profilesUsed / profileLimit) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                
                {remainingProfiles <= 1 && subscription?.plan_name === 'free' && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      You&apos;re almost at your monthly limit! 
                      <Link href="/dashboard/upgrade" className="font-medium underline ml-1">
                        Upgrade to Premium
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}