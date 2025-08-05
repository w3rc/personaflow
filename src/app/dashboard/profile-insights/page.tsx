import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ProfileCompletionTracker } from '@/components/profile-builder/ProfileCompletionTracker'

export default function ProfileInsights() {
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

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile Insights</h1>
          <p className="text-muted-foreground mt-2">
            Track your profile building progress and unlock achievements
          </p>
        </div>

        <ProfileCompletionTracker />
      </div>
    </div>
  )
}