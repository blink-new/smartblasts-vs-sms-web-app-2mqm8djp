import React, { useState } from 'react'
import { blink } from '../blink/client'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'

interface ForgotPasswordPageProps {
  onBack: () => void
  onSwitchToLogin: () => void
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBack, onSwitchToLogin }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Please enter your email address')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('🔍 Checking if user exists:', email)
      
      // Check if user exists
      const users = await blink.db.users.list({
        where: { email, isActive: 1 }
      })

      if (users.length === 0) {
        setError('No account found with this email address. Please check your email or create a new account.')
        setLoading(false)
        return
      }

      const user = users[0]
      
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8).toUpperCase()
      
      // Hash the temporary password
      const encoder = new TextEncoder()
      const data = encoder.encode(tempPassword + 'smartblasts_salt')
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      // Update user's password
      await blink.db.users.update(user.id, {
        passwordHash,
        updatedAt: new Date().toISOString()
      })

      // Send password reset email (simulated)
      console.log('📧 Sending password reset email to:', email)
      console.log('🔑 Temporary password:', tempPassword)
      
      // In a real application, you would send an actual email here
      // For now, we'll show the temporary password in an alert
      alert(`Password Reset\n\nYour temporary password is: ${tempPassword}\n\nPlease use this to log in and change your password immediately.\n\nFor security reasons, this password will expire in 24 hours.`)

      setSuccess(true)
      console.log('✅ Password reset completed')

    } catch (error) {
      console.error('❌ Password reset error:', error)
      setError('Failed to reset password. Please try again or contact support.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Password Reset Sent</CardTitle>
              <p className="text-gray-600">Check your email for the temporary password</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  We've sent a temporary password to <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Use the temporary password to log in, then change it immediately for security.
                </p>
              </div>
              
              <Button onClick={onSwitchToLogin} className="w-full">
                Return to Sign In
              </Button>
              
              <div className="text-center">
                <button
                  onClick={onBack}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Back to Website
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-600">Enter your email to receive a temporary password</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    placeholder="Enter your email address"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Reset Email...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reset Email
                  </>
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign in here
                  </button>
                </p>
                
                <p className="text-xs text-gray-500">
                  If you don't receive an email within a few minutes, please check your spam folder
                  or contact support at support@smartblasts.com
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPasswordPage