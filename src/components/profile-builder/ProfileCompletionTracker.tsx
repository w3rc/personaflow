'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Circle, 
  Trophy, 
  Target, 
  TrendingUp, 
  Users,
  Calendar,
  Award
} from 'lucide-react'
import Link from 'next/link'

interface ProfileStats {
  totalProfiles: number
  monthlyProfiles: number
  completionRate: number
  averageConfidence: number
  dataSourcesUsed: string[]
  recentActivity: Array<{
    date: string
    action: string
    target_name: string
  }>
}

interface Achievement {
  id: string
  title: string
  description: string
  progress: number
  maxProgress: number
  completed: boolean
  icon: any
  reward?: string
}

export function ProfileCompletionTracker() {
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadUserStats()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get profile statistics
      const { data: profiles } = await supabase
        .from('personality_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Get recent activity
      const { data: recentActivity } = await supabase
        .from('usage_logs')
        .select('created_at, action, metadata')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (profiles) {
        const currentMonth = new Date()
        currentMonth.setDate(1)
        
        const monthlyProfiles = profiles.filter(p => 
          new Date(p.created_at) >= currentMonth
        ).length

        const totalConfidence = profiles.reduce((sum, p) => sum + (p.confidence_score || 0), 0)
        const averageConfidence = profiles.length > 0 ? totalConfidence / profiles.length : 0

        const allDataSources = profiles.flatMap(p => p.data_sources || [])
        const uniqueDataSources = [...new Set(allDataSources)]

        const statsData: ProfileStats = {
          totalProfiles: profiles.length,
          monthlyProfiles,
          completionRate: profiles.length > 0 ? (profiles.filter(p => p.confidence_score && p.confidence_score > 0.7).length / profiles.length) * 100 : 0,
          averageConfidence,
          dataSourcesUsed: uniqueDataSources,
          recentActivity: recentActivity?.map(activity => ({
            date: activity.created_at,
            action: activity.action,
            target_name: activity.metadata?.target_name || 'Unknown'
          })) || []
        }

        setStats(statsData)
        generateAchievements(statsData)
      }
    } catch (error) {
      console.error('Error loading user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAchievements = (stats: ProfileStats) => {
    const achievementsList: Achievement[] = [
      {
        id: 'first_profile',
        title: 'Getting Started',
        description: 'Create your first personality profile',
        progress: Math.min(stats.totalProfiles, 1),
        maxProgress: 1,
        completed: stats.totalProfiles >= 1,
        icon: Target,
        reward: 'Unlocked: Profile templates'
      },
      {
        id: 'profile_creator',
        title: 'Profile Creator',
        description: 'Create 5 personality profiles',
        progress: Math.min(stats.totalProfiles, 5),
        maxProgress: 5,
        completed: stats.totalProfiles >= 5,
        icon: Users,
        reward: 'Unlocked: Advanced analytics'
      },
      {
        id: 'data_collector',
        title: 'Data Collector',
        description: 'Use 4 different data sources',
        progress: Math.min(stats.dataSourcesUsed.length, 4),
        maxProgress: 4,
        completed: stats.dataSourcesUsed.length >= 4,
        icon: TrendingUp,
        reward: 'Unlocked: Source recommendations'
      },
      {
        id: 'quality_analyst',
        title: 'Quality Analyst',
        description: 'Achieve 80%+ average confidence score',
        progress: Math.min(stats.averageConfidence * 100, 80),
        maxProgress: 80,
        completed: stats.averageConfidence >= 0.8,
        icon: Award,
        reward: 'Unlocked: Premium insights'
      },
      {
        id: 'monthly_active',
        title: 'Monthly Active',
        description: 'Create 3 profiles this month',
        progress: Math.min(stats.monthlyProfiles, 3),
        maxProgress: 3,
        completed: stats.monthlyProfiles >= 3,
        icon: Calendar,
        reward: 'Bonus: Extra monthly profiles'
      },
      {
        id: 'expert_user',
        title: 'Expert User',
        description: 'Create 10 high-quality profiles',
        progress: Math.min(stats.totalProfiles, 10),
        maxProgress: 10,
        completed: stats.totalProfiles >= 10,
        icon: Trophy,
        reward: 'Unlocked: Expert features'
      }
    ]

    setAchievements(achievementsList)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const completedAchievements = achievements.filter(a => a.completed).length
  const totalAchievements = achievements.length

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Profiles</p>
                <p className="text-2xl font-bold">{stats.totalProfiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">This Month</p>
                <p className="text-2xl font-bold">{stats.monthlyProfiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Avg. Confidence</p>
                <p className="text-2xl font-bold">{Math.round(stats.averageConfidence * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Achievements</p>
                <p className="text-2xl font-bold">{completedAchievements}/{totalAchievements}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Achievements</span>
          </CardTitle>
          <CardDescription>
            Track your progress and unlock new features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon
              const progressPercentage = (achievement.progress / achievement.maxProgress) * 100
              
              return (
                <div key={achievement.id} className={`flex items-center space-x-4 p-4 rounded-lg border ${
                  achievement.completed ? 'bg-green-50 border-green-200' : 'bg-muted/30'
                }`}>
                  <div className={`rounded-full p-2 ${
                    achievement.completed ? 'bg-green-100 text-green-600' : 'bg-muted'
                  }`}>
                    {achievement.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{achievement.title}</h4>
                      {achievement.completed && (
                        <Badge variant="default" className="bg-green-600">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    
                    {!achievement.completed && (
                      <div className="space-y-1">
                        <Progress value={progressPercentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {achievement.progress} / {achievement.maxProgress}
                        </p>
                      </div>
                    )}
                    
                    {achievement.reward && achievement.completed && (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        🎉 {achievement.reward}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-muted-foreground">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                  <span>
                    {activity.action === 'profile_created' ? 'Created profile for' : activity.action} {activity.target_name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Keep Building!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 mb-4">
            {stats.totalProfiles === 0 
              ? "Ready to create your first personality profile?"
              : "Great progress! Continue building profiles to unlock more insights and features."
            }
          </p>
          <Link href="/dashboard/create-profile">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Target className="h-4 w-4 mr-2" />
              Create New Profile
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}