import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ArrowLeft, Plus, Search, Calendar, User, Filter } from 'lucide-react'

export default async function ProfilesPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get all user's profiles in one query to avoid duplicates
  const { data: allUserProfiles, error: userError } = await supabase
    .from('personality_profiles')
    .select('id, target_name, target_email, disc_type, confidence_score, created_at, data_sources, user_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100) // Increased limit since we're getting all profiles

  // Deduplicate profiles by ID (just in case)
  const profilesMap = new Map()
  if (allUserProfiles) {
    allUserProfiles.forEach(profile => {
      profilesMap.set(profile.id, profile)
    })
  }
  
  const profiles = Array.from(profilesMap.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const error = userError

  const profileCount = profiles?.length || 0
  
  // Separate counts for display purposes (optional)
  const userProfileCount = profiles.filter(p => !p.data_sources?.includes('linkedin_extension')).length
  const extensionProfileCount = profiles.filter(p => p.data_sources?.includes('linkedin_extension')).length

  // Get subscription info
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('monthly_profile_limit, profiles_used')
    .eq('user_id', user.id)
    .single()

  const limit = subscription?.monthly_profile_limit || 5
  // Count all profiles toward usage
  const used = profileCount

  const discTypes = [
    { id: 'D', name: 'Dominance', color: 'bg-red-100 text-red-800' },
    { id: 'I', name: 'Influence', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'S', name: 'Steadiness', color: 'bg-green-100 text-green-800' },
    { id: 'C', name: 'Conscientiousness', color: 'bg-blue-100 text-blue-800' }
  ]

  const getDiscTypeInfo = (discType: string) => {
    return discTypes.find(type => type.id === discType) || { id: discType, name: discType, color: 'bg-gray-100 text-gray-800' }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="ml-auto">
            <Link href="/dashboard/create-profile">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Personality Profiles</h1>
              <p className="text-muted-foreground mt-2">
                Manage all your personality analysis profiles
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {used} of {limit} profiles used this month
            </div>
          </div>
        </div>

        {/* Usage Warning */}
        {used >= limit * 0.8 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-yellow-800">Profile Limit Warning</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You&apos;ve used {used} of {limit} profiles this month. {used >= limit ? 'Upgrade to create more profiles.' : 'Consider upgrading for unlimited profiles.'}
                </p>
              </div>
              {used >= limit && (
                <Link href="/dashboard/upgrade">
                  <Button size="sm">Upgrade Plan</Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search profiles by name or email..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </div>

        {/* Profiles Grid */}
        {error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-destructive">Failed to load profiles. Please try again.</p>
            </CardContent>
          </Card>
        ) : profiles && profiles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => {
              const discInfo = getDiscTypeInfo(profile.disc_type)
              return (
                <Card key={profile.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg truncate">{profile.target_name}</CardTitle>
                          {profile.data_sources?.includes('linkedin_extension') && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              Extension
                            </Badge>
                          )}
                        </div>
                        {profile.target_email && (
                          <CardDescription className="truncate">{profile.target_email}</CardDescription>
                        )}
                      </div>
                      <Badge variant="secondary" className={discInfo.color}>
                        {discInfo.id}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className="font-medium">
                        {Math.round((profile.confidence_score || 0) * 100)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(profile.created_at)}</span>
                    </div>

                    {profile.data_sources && profile.data_sources.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {profile.data_sources.slice(0, 3).map((source: string) => (
                          <Badge key={source} variant="outline" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                        {profile.data_sources.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.data_sources.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Link href={`/dashboard/profiles/${profile.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <User className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                      </Link>
                      <Link href={`/dashboard/writing-assistant?profile=${profile.id}`}>
                        <Button variant="outline" size="sm">
                          Write
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Profiles Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first personality profile to get started with personalized communication insights.
              </p>
              <Link href="/dashboard/create-profile">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Pagination placeholder */}
        {profiles && profiles.length >= 50 && (
          <div className="mt-8 text-center">
            <Button variant="outline">Load More Profiles</Button>
          </div>
        )}
      </div>
    </div>
  )
}