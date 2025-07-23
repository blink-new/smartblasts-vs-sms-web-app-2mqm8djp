import React, { useState } from 'react'
import { blink } from '../blink/client'
import { authService, User } from '../services/authService'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { ArrowLeft, User as UserIcon, CreditCard, Shield, Eye, EyeOff, CheckCircle } from 'lucide-react'

interface UserProfilePageProps {
  user: User
  onBack: () => void
  onUserUpdated: (updatedUser: User) => void
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ user, onBack, onUserUpdated }) => {
  const [profileData, setProfileData] = useState({
    fullName: user.fullName,
    companyName: user.companyName,
    email: user.email
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  const [loading, setLoading] = useState({
    profile: false,
    password: false
  })
  
  const [errors, setErrors] = useState({
    profile: '',
    password: ''
  })
  
  const [success, setSuccess] = useState({
    profile: false,
    password: false
  })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, profile: '' }))
    setSuccess(prev => ({ ...prev, profile: false }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, password: '' }))
    setSuccess(prev => ({ ...prev, password: false }))
  }

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password + 'smartblasts_salt')
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!profileData.fullName || !profileData.email) {
      setErrors(prev => ({ ...prev, profile: 'Please fill in all required fields' }))
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profileData.email)) {
      setErrors(prev => ({ ...prev, profile: 'Please enter a valid email address' }))
      return
    }

    setLoading(prev => ({ ...prev, profile: true }))

    try {
      // Check if email is already taken by another user
      if (profileData.email !== user.email) {
        const existingUsers = await blink.db.users.list({
          where: { email: profileData.email }
        })
        
        if (existingUsers.length > 0 && existingUsers[0].id !== user.id) {
          setErrors(prev => ({ ...prev, profile: 'This email is already taken by another account' }))
          setLoading(prev => ({ ...prev, profile: false }))
          return
        }
      }

      // Update user profile
      await blink.db.users.update(user.id, {
        fullName: profileData.fullName,
        companyName: profileData.companyName,
        email: profileData.email,
        updatedAt: new Date().toISOString()
      })

      // Update the user object
      const updatedUser = {
        ...user,
        fullName: profileData.fullName,
        companyName: profileData.companyName,
        email: profileData.email
      }

      onUserUpdated(updatedUser)
      setSuccess(prev => ({ ...prev, profile: true }))
      
      setTimeout(() => {
        setSuccess(prev => ({ ...prev, profile: false }))
      }, 3000)

    } catch (error) {
      console.error('Profile update error:', error)
      setErrors(prev => ({ ...prev, profile: 'Failed to update profile. Please try again.' }))
    } finally {
      setLoading(prev => ({ ...prev, profile: false }))
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setErrors(prev => ({ ...prev, password: 'Please fill in all password fields' }))
      return
    }

    if (passwordData.newPassword.length < 6) {
      setErrors(prev => ({ ...prev, password: 'New password must be at least 6 characters long' }))
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors(prev => ({ ...prev, password: 'New passwords do not match' }))
      return
    }

    setLoading(prev => ({ ...prev, password: true }))

    try {
      // Verify current password
      const currentPasswordHash = await hashPassword(passwordData.currentPassword)
      const users = await blink.db.users.list({
        where: { id: user.id, passwordHash: currentPasswordHash }
      })

      if (users.length === 0) {
        setErrors(prev => ({ ...prev, password: 'Current password is incorrect' }))
        setLoading(prev => ({ ...prev, password: false }))
        return
      }

      // Hash new password
      const newPasswordHash = await hashPassword(passwordData.newPassword)

      // Update password
      await blink.db.users.update(user.id, {
        passwordHash: newPasswordHash,
        updatedAt: new Date().toISOString()
      })

      setSuccess(prev => ({ ...prev, password: true }))
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      setTimeout(() => {
        setSuccess(prev => ({ ...prev, password: false }))
      }, 3000)

    } catch (error) {
      console.error('Password update error:', error)
      setErrors(prev => ({ ...prev, password: 'Failed to update password. Please try again.' }))
    } finally {
      setLoading(prev => ({ ...prev, password: false }))
    }
  }

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'free': return 'bg-gray-100 text-gray-800'
      case 'starter': return 'bg-blue-100 text-blue-800'
      case 'professional': return 'bg-purple-100 text-purple-800'
      case 'enterprise': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'trial': return 'bg-yellow-100 text-yellow-800'
      case 'expired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Subscription</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <p className="text-gray-600">Update your personal and company information</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  {errors.profile && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.profile}</AlertDescription>
                    </Alert>
                  )}
                  
                  {success.profile && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>Profile updated successfully!</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleProfileChange}
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
                        value={profileData.email}
                        onChange={handleProfileChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={profileData.companyName}
                      onChange={handleProfileChange}
                      placeholder="Enter your company name"
                    />
                  </div>

                  <Button type="submit" disabled={loading.profile}>
                    {loading.profile ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <p className="text-gray-600">View your current plan and usage</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Current Plan</Label>
                      <div className="mt-1">
                        <Badge className={getPlanBadgeColor(user.planType)}>
                          {user.planType.charAt(0).toUpperCase() + user.planType.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <div className="mt-1">
                        <Badge className={getStatusBadgeColor(user.subscriptionStatus)}>
                          {user.subscriptionStatus.charAt(0).toUpperCase() + user.subscriptionStatus.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Messages Used</Label>
                      <div className="mt-1">
                        <div className="text-2xl font-bold text-gray-900">
                          {user.messagesSent} / {user.messageLimit}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((user.messagesSent / user.messageLimit) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Usage Percentage</Label>
                      <div className="mt-1 text-lg font-semibold text-gray-900">
                        {Math.round((user.messagesSent / user.messageLimit) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>

                {user.messagesSent >= user.messageLimit * 0.8 && (
                  <Alert>
                    <AlertDescription>
                      You've used {Math.round((user.messagesSent / user.messageLimit) * 100)}% of your message limit. 
                      Consider upgrading your plan to continue sending messages.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <p className="text-gray-600">Update your account password for better security</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  {errors.password && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.password}</AlertDescription>
                    </Alert>
                  )}
                  
                  {success.password && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>Password updated successfully!</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your current password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your new password (min 6 characters)"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm your new password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading.password}>
                    {loading.password ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating Password...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default UserProfilePage