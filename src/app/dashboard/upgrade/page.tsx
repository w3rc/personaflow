import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, Check, Star, Zap, Users, Crown, TrendingUp } from 'lucide-react'

export default async function UpgradePage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get current subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_type, monthly_profile_limit, profiles_used')
    .eq('user_id', user.id)
    .single()

  const currentPlan = subscription?.plan_type || 'free'
  const profilesUsed = subscription?.profiles_used || 0
  const currentLimit = subscription?.monthly_profile_limit || 5

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      icon: Star,
      color: 'bg-gray-100 text-gray-800',
      features: [
        '5 personality profiles per month',
        'Basic DISC analysis',
        'Default communication templates',
        'Writing assistant access',
        'Email support'
      ],
      limitations: [
        'Limited to 5 profiles monthly',
        'No custom templates',
        'Basic AI insights only'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '$19',
      period: 'per month',
      description: 'For professionals and small teams',
      icon: Zap,
      color: 'bg-blue-100 text-blue-800',
      popular: true,
      features: [
        '50 personality profiles per month',
        'Advanced DISC analysis with confidence scores',
        'Custom communication templates',
        'AI-powered writing suggestions',
        'LinkedIn content optimization',
        'Profile export (CSV/PDF)',
        'Priority email support',
        'Team sharing (up to 3 members)'
      ],
      limitations: []
    },
    {
      id: 'business',
      name: 'Business',
      price: '$49',
      period: 'per month',
      description: 'For growing teams and organizations',
      icon: Users,
      color: 'bg-green-100 text-green-800',
      features: [
        'Unlimited personality profiles',
        'Advanced AI personality insights',
        'Custom template marketplace',
        'Team analytics dashboard',
        'Bulk profile import/export',
        'API access for integrations',
        'Advanced team collaboration',
        'Phone + email support',
        'Custom branding options'
      ],
      limitations: []
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large organizations',
      icon: Crown,
      color: 'bg-purple-100 text-purple-800',
      features: [
        'Everything in Business plan',
        'Unlimited team members',
        'Advanced security & compliance',
        'Custom AI model training',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantees',
        'On-premise deployment options'
      ],
      limitations: []
    }
  ]

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
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Upgrade Your Plan</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Unlock powerful features to enhance your personality analysis and communication effectiveness
          </p>
        </div>

        {/* Current Usage */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Usage</span>
                <Badge variant="secondary" className="capitalize">
                  {currentPlan} Plan
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{profilesUsed} / {currentLimit}</p>
                  <p className="text-sm text-muted-foreground">Profiles used this month</p>
                </div>
                <div className="text-right">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((profilesUsed / currentLimit) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((profilesUsed / currentLimit) * 100)}% used
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Plans */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isCurrentPlan = currentPlan === plan.id
            const isUpgrade = plans.findIndex(p => p.id === currentPlan) < plans.findIndex(p => p.id === plan.id)
            
            return (
              <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''} ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500">Most Popular</Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500">Current Plan</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className={`p-2 rounded-lg ${plan.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {plan.price}
                    {plan.period !== 'pricing' && (
                      <span className="text-sm font-normal text-muted-foreground">/{plan.period}</span>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.limitations.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Limitations:</p>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="text-xs text-muted-foreground">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="pt-4">
                    {isCurrentPlan ? (
                      <Button disabled className="w-full">
                        Current Plan
                      </Button>
                    ) : plan.id === 'enterprise' ? (
                      <Button variant="outline" className="w-full">
                        Contact Sales
                      </Button>
                    ) : isUpgrade ? (
                      <Button className="w-full">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Upgrade to {plan.name}
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full">
                        Downgrade to {plan.name}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens to my profiles if I downgrade?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your existing profiles remain accessible. However, you won&apos;t be able to create new profiles beyond your plan limit until the next billing cycle.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Yes, you can cancel your subscription at any time. You&apos;ll continue to have access to paid features until the end of your billing period.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We offer a 30-day money-back guarantee for all paid plans. Contact support if you&apos;re not satisfied.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is my data secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Yes, we use enterprise-grade security with encryption at rest and in transit. Your personality profiles and data are never shared with third parties.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Need help choosing the right plan? {' '}
            <Link href="mailto:support@crystalknows-clone.com" className="text-blue-600 hover:underline">
              Contact our sales team
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}