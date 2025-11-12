import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, FileText, TrendingUp, Plus, Settings, Waves, ArrowUpRight } from 'lucide-react'

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
  const profileLimit = subscription?.monthly_profile_limit || 50
  const remainingProfiles = profileLimit - profilesUsed

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 backdrop-blur-sm bg-card/30 sticky top-0 z-50">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Waves className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">PersonaFlow</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welcome, {user.email}</span>
            <Link href="/dashboard/profiles">
              <Button variant="ghost" size="sm" className="text-foreground hover:text-primary hover:bg-primary/10">
                <Users className="h-4 w-4 mr-2" />
                All Profiles
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="ghost" size="sm" className="text-foreground hover:text-primary hover:bg-primary/10">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <form action="/auth/signout" method="post">
              <Button variant="outline" size="sm" type="submit" className="border-border/50 hover:border-primary/50 hover:bg-primary/10">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 p-4 md:p-8 pt-8">
        {/* Welcome Banner */}
        <div className="wave-bg-pink rounded-3xl p-8 mb-6">
          <h2 className="text-3xl font-bold text-primary-foreground mb-2">
            Welcome back!
          </h2>
          <p className="text-primary-foreground/90 text-lg">
            Let&apos;s continue improving your communication skills today.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Profiles</CardTitle>
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{profilesUsed}</div>
              <p className="text-xs text-green-400 mt-1">
                +{remainingProfiles} remaining this month
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Templates</CardTitle>
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">12</div>
              <p className="text-xs text-muted-foreground mt-1">Available templates</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Plan</CardTitle>
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground capitalize">{subscription?.plan_name || 'Free'}</div>
              <p className="text-xs text-muted-foreground mt-1">{profileLimit} profiles/month</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Usage</CardTitle>
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{Math.round((profilesUsed / profileLimit) * 100)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Of monthly limit</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Card className="border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center justify-between">
                Create New Profile
                <ArrowUpRight className="h-4 w-4 text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Analyze someone&apos;s personality to improve your communication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/create-profile">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center justify-between">
                Profile Insights
                <ArrowUpRight className="h-4 w-4 text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Track progress and unlock achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/profile-insights">
                <Button variant="outline" className="w-full border-border/50 hover:border-primary/50">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Insights
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center justify-between">
                Communication Templates
                <ArrowUpRight className="h-4 w-4 text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Browse templates optimized for different personality types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/templates">
                <Button variant="outline" className="w-full border-border/50 hover:border-primary/50">
                  View Templates
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center justify-between">
                Writing Assistant
                <ArrowUpRight className="h-4 w-4 text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Get personalized suggestions for your messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/writing-assistant">
                <Button variant="outline" className="w-full border-border/50 hover:border-primary/50">
                  Start Writing
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center justify-between">
                AI Tools Settings
                <ArrowUpRight className="h-4 w-4 text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Customize AI prompts for communication tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/settings">
                <Button variant="outline" className="w-full border-border/50 hover:border-primary/50">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Profiles */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1 border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Profiles</CardTitle>
              <CardDescription className="text-muted-foreground">Your latest personality analyses</CardDescription>
            </CardHeader>
            <CardContent>
              {profiles.length > 0 ? (
                <div className="space-y-3">
                  {profiles.slice(0, 5).map((profile) => (
                    <Link key={profile.id} href={`/dashboard/profiles/${profile.id}`}>
                      <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-secondary/50 cursor-pointer transition-all duration-200 border border-transparent hover:border-primary/30">
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none text-foreground">
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
                    </Link>
                  ))}
                  {profiles.length > 5 && (
                    <Link href="/dashboard/profiles">
                      <Button variant="ghost" className="w-full hover:text-primary">
                        View All Profiles
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No profiles created yet</p>
                  <Link href="/dashboard/create-profile">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Create Your First Profile</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1 border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-foreground">Usage This Month</CardTitle>
              <CardDescription className="text-muted-foreground">Track your subscription usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Profiles Created</span>
                    <span className="text-foreground font-semibold">{profilesUsed}/{profileLimit}</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((profilesUsed / profileLimit) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {remainingProfiles <= 1 && subscription?.plan_name === 'free' && (
                  <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-xl">
                    <p className="text-sm text-foreground">
                      You&apos;re almost at your monthly limit!
                      <Link href="/dashboard/upgrade" className="font-medium underline ml-1 text-primary hover:text-primary/80">
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