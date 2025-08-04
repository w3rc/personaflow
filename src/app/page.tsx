import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, MessageSquare, TrendingUp, Lightbulb } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Crystal Knows Clone</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Unlock the Power of 
              <span className="text-blue-600"> Personality Insights</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Analyze personality types using the DISC framework to improve communication, 
              build better relationships, and achieve more successful outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-8 py-3">
                  Start Free Analysis
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to better communication
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>1. Analyze Personalities</CardTitle>
                <CardDescription>
                  Input text samples to analyze someone&apos;s DISC personality type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes communication patterns to determine if someone is more 
                  Dominant, Influential, Steady, or Conscientious.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>2. Get Insights</CardTitle>
                <CardDescription>
                  Receive detailed communication tips and personality insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Learn about their strengths, challenges, motivators, and exactly 
                  how to communicate with them effectively.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Lightbulb className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <CardTitle>3. Communicate Better</CardTitle>
                <CardDescription>
                  Use our writing assistant and templates for better outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get personalized email templates, subject line suggestions, 
                  and real-time writing tips.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* DISC Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              DISC Personality Types
            </h2>
            <p className="text-xl text-gray-600">
              Understand the four main personality styles
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-red-800">D - Dominance</CardTitle>
                <CardDescription>Direct & Results-Oriented</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Strengths:</strong> Decisive, confident, direct
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Communication:</strong> Be brief, focus on results
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardHeader className="bg-yellow-50">
                <CardTitle className="text-yellow-800">I - Influence</CardTitle>
                <CardDescription>Outgoing & People-Oriented</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Strengths:</strong> Enthusiastic, optimistic, persuasive
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Communication:</strong> Be energetic, allow social time
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-800">S - Steadiness</CardTitle>
                <CardDescription>Patient & Supportive</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Strengths:</strong> Reliable, patient, good listener
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Communication:</strong> Be patient, show appreciation
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-800">C - Conscientiousness</CardTitle>
                <CardDescription>Analytical & Detail-Oriented</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Strengths:</strong> Accurate, analytical, systematic
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Communication:</strong> Provide details, be logical
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Improve Your Communication?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who use personality insights to build 
            better relationships and achieve greater success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
          </div>
          <p className="text-blue-200 text-sm mt-4">
            Free tier includes 5 personality analyses per month
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Crystal Knows Clone</h3>
            <p className="text-gray-400 mb-4">
              Personality insights platform for better communication
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/auth/login" className="text-gray-400 hover:text-white">
                Sign In
              </Link>
              <Link href="/auth/signup" className="text-gray-400 hover:text-white">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}