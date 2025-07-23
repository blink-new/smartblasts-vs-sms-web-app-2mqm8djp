import React, { useState, useEffect } from 'react'
import { blink } from '../blink/client'
import { authService } from '../services/authService'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { 
  Check, 
  X, 
  Crown, 
  Zap, 
  Users, 
  BarChart3, 
  MessageCircle, 
  ArrowLeft,
  CreditCard,
  Star
} from 'lucide-react'

interface UpgradePageProps {
  user: any
  onBack: () => void
  onUpgradeSuccess: (newPlan: string) => void
}

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  messageLimit: number
  features: string[]
  isActive: boolean
}

const UpgradePage: React.FC<UpgradePageProps> = ({ user, onBack, onUpgradeSuccess }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [error, setError] = useState('')

  const loadSubscriptionPlans = async () => {
    try {
      const plansData = await blink.db.subscriptionPlans.list({
        where: { isActive: 1 },
        orderBy: { price: 'asc' }
      })

      const formattedPlans = plansData.map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        messageLimit: plan.message_limit,
        features: JSON.parse(plan.features || '[]'),
        isActive: Number(plan.is_active) > 0
      }))

      setPlans(formattedPlans)
    } catch (error) {
      console.error('Error loading subscription plans:', error)
      setError('Failed to load subscription plans. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubscriptionPlans()
  }, [])

  const handleUpgrade = async (planId: string) => {
    if (!planId || planId === 'free') return

    setUpgrading(true)
    setSelectedPlan(planId)
    setError('')

    try {
      console.log('🚀 Starting upgrade process for plan:', planId)

      const selectedPlanData = plans.find(p => p.id === planId)
      if (!selectedPlanData) {
        setError('Selected plan not found. Please try again.')
        return
      }

      // In a real application, you would integrate with Stripe here
      // For now, we'll simulate the upgrade process
      
      // Update user's plan using authService
      const upgradeSuccess = await authService.upgradePlan(user.id, planId, selectedPlanData.messageLimit)
      
      if (!upgradeSuccess) {
        setError('Failed to upgrade plan. Please try again.')
        return
      }

      console.log('✅ Upgrade completed successfully!')
      
      alert(`🎉 Congratulations! You've successfully upgraded to the ${selectedPlanData.name}. You now have ${selectedPlanData.messageLimit.toLocaleString()} messages per month!`)
      
      onUpgradeSuccess(planId)

    } catch (error) {
      console.error('❌ Upgrade error:', error)
      setError('Upgrade failed. Please try again or contact support.')
    } finally {
      setUpgrading(false)
      setSelectedPlan('')
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'starter': return <Zap className="h-6 w-6" />
      case 'professional': return <Crown className="h-6 w-6" />
      case 'enterprise': return <Star className="h-6 w-6" />
      default: return <MessageCircle className="h-6 w-6" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'starter': return 'border-blue-200 bg-blue-50'
      case 'professional': return 'border-purple-200 bg-purple-50'
      case 'enterprise': return 'border-orange-200 bg-orange-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getButtonColor = (planId: string) => {
    switch (planId) {
      case 'starter': return 'bg-blue-600 hover:bg-blue-700'
      case 'professional': return 'bg-purple-600 hover:bg-purple-700'
      case 'enterprise': return 'bg-orange-600 hover:bg-orange-700'
      default: return 'bg-gray-600 hover:bg-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-blue-600">Upgrade Your Plan</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Current: {user.planType === 'free' ? 'Free Trial' : user.planType} 
                ({user.messagesSent}/{user.messageLimit} messages used)
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Limit Warning */}
        {user.messagesSent >= user.messageLimit && (
          <Alert className="mb-8 border-orange-200 bg-orange-50">
            <MessageCircle className="h-4 w-4" />
            <AlertDescription className="text-orange-800">
              <strong>Message limit reached!</strong> You've used all {user.messageLimit} messages in your {user.planType === 'free' ? 'free trial' : 'current plan'}. 
              Upgrade now to continue sending campaigns and unlock advanced features.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Current Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Used</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.messagesSent}</div>
              <p className="text-xs text-muted-foreground">
                of {user.messageLimit} available
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((user.messagesSent / user.messageLimit) * 100, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{user.planType}</div>
              <p className="text-xs text-muted-foreground">
                {user.subscriptionStatus === 'trial' ? 'Free Trial' : 'Active Subscription'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining Messages</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.max(0, user.messageLimit - user.messagesSent)}</div>
              <p className="text-xs text-muted-foreground">
                messages left this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Plans */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-xl text-gray-600">
            Unlock the full power of SmartBlasts with our flexible pricing plans
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${getPlanColor(plan.id)} ${plan.id === 'professional' ? 'ring-2 ring-purple-500' : ''}`}
            >
              {plan.id === 'professional' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {getPlanIcon(plan.id)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  ${plan.price}
                  <span className="text-sm font-normal text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600">
                  {plan.messageLimit.toLocaleString()} messages per month
                </p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.id === 'free' ? (
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    disabled
                  >
                    Current Plan
                  </Button>
                ) : user.planType === plan.id ? (
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    disabled
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className={`w-full text-white ${getButtonColor(plan.id)}`}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading}
                  >
                    {upgrading && selectedPlan === plan.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Upgrading...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Upgrade Now
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What happens to unused messages?</h4>
              <p className="text-gray-600">Messages reset monthly and don't roll over. We recommend choosing a plan that fits your monthly usage.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is there a setup fee?</h4>
              <p className="text-gray-600">No setup fees or hidden costs. You only pay the monthly subscription price for your chosen plan.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period.</p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Need help choosing the right plan? 
            <button 
              className="text-blue-600 hover:text-blue-700 font-medium ml-1"
              onClick={() => alert('Contact our support team at support@smartblasts.com or call 1-800-SMARTBLASTS')}
            >
              Contact our sales team
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default UpgradePage