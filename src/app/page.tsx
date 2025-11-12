import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, MessageSquare, TrendingUp, Lightbulb, ArrowRight, Waves } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-2">
              <Waves className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">PersonaFlow</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-foreground hover:text-primary">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 wave-pattern gradient-mesh overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h1 className="text-6xl font-bold text-foreground mb-6 leading-tight">
                Work smarter, not harder with{' '}
                <span className="text-primary">PersonaFlow</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Automate personality analysis, streamline communication, and collaborate seamlessly - all in
                one platform. Built with AI-powered DISC insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
                    Start free trial
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="ghost" size="lg" className="text-lg px-8 py-6 text-foreground hover:text-primary rounded-xl group">
                    Explore <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mock Dashboard Preview */}
            <div className="relative">
              <div className="wave-bg-pink rounded-3xl p-8 shadow-2xl">
                <div className="bg-card rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Waves className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">PersonaFlow</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Personality Analyses</span>
                      <span className="text-2xl font-bold text-foreground">1,789</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-primary rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-secondary/50 p-4 rounded-xl">
                        <div className="text-sm text-muted-foreground mb-1">Dominant</div>
                        <div className="text-xl font-bold text-foreground">342</div>
                      </div>
                      <div className="bg-secondary/50 p-4 rounded-xl">
                        <div className="text-sm text-muted-foreground mb-1">Influential</div>
                        <div className="text-xl font-bold text-foreground">456</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to better communication
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-foreground">1. Analyze Personalities</CardTitle>
                <CardDescription className="text-muted-foreground">
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

            <Card className="border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-foreground">2. Get Insights</CardTitle>
                <CardDescription className="text-muted-foreground">
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

            <Card className="border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-foreground">3. Communicate Better</CardTitle>
                <CardDescription className="text-muted-foreground">
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
      <section className="py-20 bg-background wave-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-foreground mb-4">
              DISC Personality Types
            </h2>
            <p className="text-xl text-muted-foreground">
              Understand the four main personality styles
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-red-500/30 bg-card/80 backdrop-blur hover:border-red-500/60 transition-all duration-300 hover:scale-105">
              <CardHeader className="bg-gradient-to-br from-red-500/10 to-red-500/5">
                <CardTitle className="text-red-400">D - Dominance</CardTitle>
                <CardDescription className="text-muted-foreground">Direct & Results-Oriented</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong className="text-foreground">Strengths:</strong> Decisive, confident, direct
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Communication:</strong> Be brief, focus on results
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-500/30 bg-card/80 backdrop-blur hover:border-yellow-500/60 transition-all duration-300 hover:scale-105">
              <CardHeader className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
                <CardTitle className="text-yellow-400">I - Influence</CardTitle>
                <CardDescription className="text-muted-foreground">Outgoing & People-Oriented</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong className="text-foreground">Strengths:</strong> Enthusiastic, optimistic, persuasive
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Communication:</strong> Be energetic, allow social time
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-500/30 bg-card/80 backdrop-blur hover:border-green-500/60 transition-all duration-300 hover:scale-105">
              <CardHeader className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                <CardTitle className="text-green-400">S - Steadiness</CardTitle>
                <CardDescription className="text-muted-foreground">Patient & Supportive</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong className="text-foreground">Strengths:</strong> Reliable, patient, good listener
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Communication:</strong> Be patient, show appreciation
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-500/30 bg-card/80 backdrop-blur hover:border-blue-500/60 transition-all duration-300 hover:scale-105">
              <CardHeader className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                <CardTitle className="text-blue-400">C - Conscientiousness</CardTitle>
                <CardDescription className="text-muted-foreground">Analytical & Detail-Oriented</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong className="text-foreground">Strengths:</strong> Accurate, analytical, systematic
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Communication:</strong> Provide details, be logical
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="wave-bg-pink absolute inset-0"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-primary-foreground mb-6">
            Ready to Improve Your Communication?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who use personality insights to build
            better relationships and achieve greater success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8 py-6 bg-background text-foreground hover:bg-background/90 rounded-xl shadow-xl">
                Start Free Trial
              </Button>
            </Link>
          </div>
          <p className="text-primary-foreground/80 text-sm mt-6">
            Free tier includes 5 personality analyses per month
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Waves className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">PersonaFlow</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              AI-powered personality insights for better communication
            </p>
            <div className="flex justify-center space-x-8">
              <Link href="/auth/login" className="text-muted-foreground hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link href="/auth/signup" className="text-muted-foreground hover:text-primary transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}