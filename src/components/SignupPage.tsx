import React, { useState } from 'react'
import { blink } from '../blink/client'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Eye, EyeOff, ArrowLeft, CheckCircle, Zap, Users, BarChart3 } from 'lucide-react'

interface SignupPageProps {
  onBack: () => void
  onSignupSuccess: (user: any) => void
  onSwitchToLogin: () => void
}

const SignupPage: React.FC<SignupPageProps> = ({ onBack, onSignupSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    phoneNumber: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('') // Clear error when user starts typing
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Please fill in all required fields')
      return false
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    return true
  }

  const hashPassword = async (password: string): Promise<string> => {
    // Simple password hashing (in production, use bcrypt or similar)
    const encoder = new TextEncoder()
    const data = encoder.encode(password + 'smartblasts_salt')
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      console.log('🚀 Starting signup process...')
      
      // Check if user already exists
      const existingUsers = await blink.db.users.list({
        where: { email: formData.email }
      })

      if (existingUsers.length > 0) {
        setError('An account with this email already exists. Please sign in instead.')
        setLoading(false)
        return
      }

      // Hash the password
      const passwordHash = await hashPassword(formData.password)
      
      // Create user account
      const userId = `user_${Date.now()}`
      const now = new Date().toISOString()
      
      const newUser = await blink.db.users.create({
        id: userId,
        email: formData.email,
        passwordHash,
        fullName: formData.fullName,
        companyName: formData.companyName || '',
        phoneNumber: formData.phoneNumber || '',
        planType: 'free',
        messagesSent: 0,
        messageLimit: 25,
        subscriptionStatus: 'trial',
        subscriptionStartDate: now,
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
        createdAt: now,
        updatedAt: now,
        lastLogin: now,
        isActive: 1
      })

      console.log('✅ User created successfully:', newUser)

      // Create session token
      const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days

      await blink.db.userSessions.create({
        id: `sess_${Date.now()}`,
        userId,
        sessionToken,
        expiresAt: sessionExpiry,
        createdAt: now
      })

      // Store session in localStorage
      localStorage.setItem('smartblasts_session', sessionToken)
      localStorage.setItem('smartblasts_user', JSON.stringify({
        id: userId,
        email: formData.email,
        fullName: formData.fullName,
        companyName: formData.companyName,
        planType: 'free',
        messagesSent: 0,
        messageLimit: 25,
        subscriptionStatus: 'trial'
      }))

      console.log('✅ Signup completed successfully!')
      
      onSignupSuccess({
        id: userId,
        email: formData.email,
        fullName: formData.fullName,
        companyName: formData.companyName,
        planType: 'free',
        messagesSent: 0,
        messageLimit: 25,
        subscriptionStatus: 'trial'
      })

    } catch (error) {
      console.error('❌ Signup error:', error)
      setError('Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Benefits */}
        <div className="hidden lg:block">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Start Your Free Trial
            </h1>
            <p className="text-xl text-gray-600">
              Get 25 free messages to test our powerful contact form outreach platform
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">25 Free Messages</h3>
                <p className="text-gray-600">Test our platform with 25 complimentary messages - no credit card required</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Zap className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Drip Campaign Builder</h3>
                <p className="text-gray-600">Create automated message sequences with custom timing and personalization</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Contact Management</h3>
                <p className="text-gray-600">Import contacts via CSV, manage duplicates, and organize your outreach lists</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Analytics & Tracking</h3>
                <p className="text-gray-600">Monitor campaign performance, response rates, and optimize your outreach</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Signup Form */}
        <div className="w-full max-w-md mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Create Account</CardTitle>
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-600">Start your free trial today</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Enter your company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a password (min 6 characters)"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    'Start Free Trial'
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={onSwitchToLogin}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                    Your free trial includes 25 messages with no credit card required.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SignupPage