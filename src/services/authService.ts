import { blink } from '../blink/client'

export interface User {
  id: string
  email: string
  fullName: string
  companyName: string
  planType: string
  messagesSent: number
  messageLimit: number
  subscriptionStatus: string
}

class AuthService {
  private currentUser: User | null = null

  async checkSession(): Promise<User | null> {
    try {
      const sessionToken = localStorage.getItem('smartblasts_session')
      if (!sessionToken) {
        return null
      }

      // Check if session is valid
      const sessions = await blink.db.userSessions.list({
        where: { sessionToken }
      })

      if (sessions.length === 0) {
        this.clearSession()
        return null
      }

      const session = sessions[0]
      
      // Check if session is expired
      if (new Date(session.expires_at) < new Date()) {
        await blink.db.userSessions.delete(session.id)
        this.clearSession()
        return null
      }

      // Get user data
      const users = await blink.db.users.list({
        where: { id: session.user_id, isActive: 1 }
      })

      if (users.length === 0) {
        this.clearSession()
        return null
      }

      const user = users[0]
      this.currentUser = {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        companyName: user.company_name,
        planType: user.plan_type,
        messagesSent: user.messages_sent,
        messageLimit: user.message_limit,
        subscriptionStatus: user.subscription_status
      }

      return this.currentUser
    } catch (error) {
      console.error('Session check failed:', error)
      this.clearSession()
      return null
    }
  }

  async logout(): Promise<void> {
    try {
      const sessionToken = localStorage.getItem('smartblasts_session')
      if (sessionToken) {
        // Delete session from database
        const sessions = await blink.db.userSessions.list({
          where: { sessionToken }
        })

        for (const session of sessions) {
          await blink.db.userSessions.delete(session.id)
        }
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearSession()
    }
  }

  private clearSession(): void {
    localStorage.removeItem('smartblasts_session')
    localStorage.removeItem('smartblasts_user')
    this.currentUser = null
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  async updateUserMessageCount(userId: string, messagesSent: number): Promise<void> {
    try {
      await blink.db.users.update(userId, {
        messagesSent,
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      })

      // Update current user if it's the same user
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser.messagesSent = messagesSent
        localStorage.setItem('smartblasts_user', JSON.stringify(this.currentUser))
      }
    } catch (error) {
      console.error('Failed to update message count:', error)
      throw error
    }
  }

  async upgradePlan(userId: string, planType: string, messageLimit: number): Promise<boolean> {
    try {
      const now = new Date().toISOString()
      const subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days

      await blink.db.users.update(userId, {
        planType,
        messageLimit,
        subscriptionStatus: 'active',
        subscriptionStartDate: now,
        subscriptionEndDate,
        updatedAt: now
      })

      // Update current user
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser.planType = planType
        this.currentUser.messageLimit = messageLimit
        this.currentUser.subscriptionStatus = 'active'
        localStorage.setItem('smartblasts_user', JSON.stringify(this.currentUser))
      }

      return true
    } catch (error) {
      console.error('Failed to upgrade plan:', error)
      return false
    }
  }

  async login(email: string, password: string): Promise<User | null> {
    try {
      console.log('🔐 Attempting login for:', email)
      
      // Hash the password for comparison
      const passwordHash = await this.hashPassword(password)
      
      // Find user with matching email and password
      const users = await blink.db.users.list({
        where: { 
          email, 
          passwordHash,
          isActive: 1 
        }
      })

      if (users.length === 0) {
        console.log('❌ Invalid credentials')
        return null
      }

      const user = users[0]
      console.log('✅ User found:', user.email)

      // Update last login
      await blink.db.users.update(user.id, {
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // Create new session
      const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days

      await blink.db.userSessions.create({
        id: `sess_${Date.now()}`,
        userId: user.id,
        sessionToken,
        expiresAt: sessionExpiry,
        createdAt: new Date().toISOString()
      })

      // Store session in localStorage
      localStorage.setItem('smartblasts_session', sessionToken)

      this.currentUser = {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        companyName: user.company_name,
        planType: user.plan_type,
        messagesSent: user.messages_sent,
        messageLimit: user.message_limit,
        subscriptionStatus: user.subscription_status
      }

      localStorage.setItem('smartblasts_user', JSON.stringify(this.currentUser))
      console.log('✅ Login successful')

      return this.currentUser
    } catch (error) {
      console.error('❌ Login error:', error)
      return null
    }
  }

  private async hashPassword(password: string): Promise<string> {
    // Simple password hashing (in production, use bcrypt or similar)
    const encoder = new TextEncoder()
    const data = encoder.encode(password + 'smartblasts_salt')
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  async refreshUserData(userId: string): Promise<User | null> {
    try {
      const users = await blink.db.users.list({
        where: { id: userId, isActive: 1 }
      })

      if (users.length === 0) {
        return null
      }

      const user = users[0]
      this.currentUser = {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        companyName: user.company_name,
        planType: user.plan_type,
        messagesSent: user.messages_sent,
        messageLimit: user.message_limit,
        subscriptionStatus: user.subscription_status
      }

      localStorage.setItem('smartblasts_user', JSON.stringify(this.currentUser))
      return this.currentUser
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      return null
    }
  }

  // Change password
  async changePassword(email: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      // Verify current password
      const currentPasswordHash = await this.hashPassword(currentPassword)
      const users = await blink.db.users.list({
        where: { email, passwordHash: currentPasswordHash }
      })

      if (users.length === 0) {
        return false // Current password is incorrect
      }

      // Update to new password
      const newPasswordHash = await this.hashPassword(newPassword)
      await blink.db.users.update(users[0].id, {
        passwordHash: newPasswordHash,
        updatedAt: new Date().toISOString()
      })

      return true
    } catch (error) {
      console.error('Error changing password:', error)
      return false
    }
  }
}

export const authService = new AuthService()