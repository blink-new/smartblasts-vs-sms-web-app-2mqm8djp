import React, { useState, useEffect, useCallback } from 'react'
import { authService, User } from './services/authService'
import SmartBlastsWebsite from './components/SmartBlastsWebsite'
import Dashboard from './components/Dashboard'
import SignupPage from './components/SignupPage'
import LoginPage from './components/LoginPage'
import UpgradePage from './components/UpgradePage'
import UserProfile from './components/UserProfile'
import AdminDashboard from './components/AdminDashboard'
import TermsOfService from './components/TermsOfService'
import PrivacyPolicy from './components/PrivacyPolicy'
import { Loader2 } from 'lucide-react'

type ViewType = 'website' | 'signup' | 'login' | 'dashboard' | 'upgrade' | 'profile' | 'admin' | 'terms' | 'privacy'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ViewType>('website')

  const checkAuthStatus = useCallback(async () => {
    try {
      const authenticatedUser = await authService.checkSession()
      setUser(authenticatedUser)
      
      // If user is authenticated and on website, redirect to dashboard
      if (authenticatedUser && currentView === 'website') {
        setCurrentView('dashboard')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }, [currentView])

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  const handleSignupSuccess = (newUser: User) => {
    setUser(newUser)
    setCurrentView('dashboard')
  }

  const handleLoginSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser)
    setCurrentView('dashboard')
  }

  const handleLogout = async () => {
    await authService.logout()
    setUser(null)
    setCurrentView('website')
  }

  const handleUpgradeSuccess = async (newPlan: string) => {
    if (user) {
      // Refresh user data to get updated plan info
      const updatedUser = await authService.refreshUserData(user.id)
      if (updatedUser) {
        setUser(updatedUser)
      }
    }
    setCurrentView('dashboard')
  }

  const checkMessageLimit = () => {
    if (user && user.messagesSent >= user.messageLimit) {
      setCurrentView('upgrade')
      return false
    }
    return true
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Route to different views based on currentView state
  switch (currentView) {
    case 'signup':
      return (
        <SignupPage
          onBack={() => setCurrentView('website')}
          onSignupSuccess={handleSignupSuccess}
          onSwitchToLogin={() => setCurrentView('login')}
        />
      )

    case 'login':
      return (
        <LoginPage
          onBack={() => setCurrentView('website')}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignup={() => setCurrentView('signup')}
          onForgotPassword={() => setCurrentView('forgot-password')}
        />
      )

    case 'terms':
      return (
        <TermsOfService
          onBack={() => setCurrentView('website')}
        />
      )

    case 'privacy':
      return (
        <PrivacyPolicy
          onBack={() => setCurrentView('website')}
        />
      )

    case 'admin':
      return (
        <AdminDashboard
          onBack={() => setCurrentView('website')}
        />
      )

    case 'upgrade':
      return user ? (
        <UpgradePage
          user={user}
          onBack={() => setCurrentView('dashboard')}
          onUpgradeSuccess={handleUpgradeSuccess}
        />
      ) : (
        <div>Redirecting...</div>
      )

    case 'dashboard':
      return user ? (
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
          onBackToLanding={() => setCurrentView('website')}
          onUpgradeRequired={() => setCurrentView('upgrade')}
          onGoToProfile={() => setCurrentView('profile')}
          checkMessageLimit={checkMessageLimit}
        />
      ) : (
        <div>Redirecting...</div>
      )

    case 'profile':
      return user ? (
        <UserProfile
          user={user}
          onBack={() => setCurrentView('dashboard')}
          onUserUpdate={(updatedUser) => setUser(updatedUser)}
        />
      ) : (
        <div>Redirecting...</div>
      )

    default:
      return (
        <SmartBlastsWebsite 
          user={user} 
          onLogin={() => setCurrentView('login')}
          onSignup={() => setCurrentView('signup')}
          onGoToDashboard={() => setCurrentView('dashboard')}
          onGoToTerms={() => setCurrentView('terms')}
          onGoToPrivacy={() => setCurrentView('privacy')}
          onGoToAdmin={() => setCurrentView('admin')}
        />
      )
  }
}

export default App