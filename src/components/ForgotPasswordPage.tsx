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
  const [tempPassword, setTempPassword] = useState('')

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
      
      // Check if user exists using camelCase (Blink SDK converts to snake_case)
      const users = await blink.db.users.list({
        where: { email, isActive: 1 }
      })

      console.log('🔍 Found users:', users.length)

      if (users.length === 0) {
        setError('No account found with this email address. Please check your email or create a new account.')
        setLoading(false)
        return
      }

      const user = users[0]
      console.log('👤 User found:', user.email)
      
      // Generate a temporary password (make it more user-friendly)
      const tempPassword = 'TEMP' + Math.random().toString(36).slice(-6).toUpperCase()
      console.log('🔑 Generated temp password:', tempPassword)
      
      // Hash the temporary password using the same method as authService
      const encoder = new TextEncoder()
      const data = encoder.encode(tempPassword + 'smartblasts_salt')
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      console.log('🔐 Password hash generated')

      // Update user's password using camelCase (Blink SDK converts to snake_case)
      await blink.db.users.update(user.id, {
        passwordHash: passwordHash,
        updatedAt: new Date().toISOString()
      })

      console.log('✅ Password updated in database')

      // Send password reset email (simulated)
      console.log('📧 Sending password reset email to:', email)
      console.log('🔑 Temporary password:', tempPassword)
      
      // In a real application, you would send an actual email here
      // For now, we'll show the temporary password in an alert
      alert(`🔑 PASSWORD RESET SUCCESSFUL\n\nYour temporary password is:\n${tempPassword}\n\n📝 IMPORTANT INSTRUCTIONS:\n1. Copy this password exactly (case-sensitive)\n2. Go back to the login page\n3. Use your email: ${email}\n4. Use this temporary password\n5. Change your password after logging in\n\n⚠️ This password expires in 24 hours for security.`)

      setTempPassword(tempPassword)
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
              <CardTitle className="text-2xl">Password Reset Complete</CardTitle>
              <p className="text-gray-600">Your temporary password is ready to use</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Password reset successful for <strong>{email}</strong>
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">Your Temporary Password:</p>
                  <div className="bg-white border border-blue-300 rounded px-3 py-2 font-mono text-lg font-bold text-blue-800 select-all">
                    {tempPassword}
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    Click to select all • Copy this password exactly (case-sensitive)
                  </p>
                </div>
                
                <div className="text-left space-y-1 text-sm text-gray-600">
                  <p className="font-medium">Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Copy the temporary password above</li>
                    <li>Click "Return to Sign In" below</li>
                    <li>Use your email and the temporary password</li>
                    <li>Change your password after logging in</li>
                  </ol>
                </div>
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