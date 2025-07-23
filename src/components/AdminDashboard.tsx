import React, { useState, useEffect } from 'react'
import { blink } from '../blink/client'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { 
  ArrowLeft, 
  Users, 
  Search,
  Eye,
  Ban,
  CheckCircle,
  Trash2,
  Calendar,
  CreditCard,
  BarChart3,
  Crown,
  Mail,
  Phone,
  Building
} from 'lucide-react'

interface AdminDashboardProps {
  onBack: () => void
}

interface UserData {
  id: string
  email: string
  fullName: string
  phone: string
  company: string
  planType: string
  messagesSent: number
  messageLimit: number
  campaignsCreated: number
  status: string
  createdAt: string
  lastLoginAt: string
  billingPeriod: string
  planAmount: number
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [filterPlan, setFilterPlan] = useState<string>('all')

  const loadUsers = async () => {
    try {
      setLoading(true)
      
      // Load all users from the database
      const userData = await blink.db.users.list({
        orderBy: { created_at: 'desc' }
      })
      
      const formattedUsers = userData.map((user: any) => ({
        id: user.id,
        email: user.email,
        fullName: user.full_name || '',
        phone: user.phone || '',
        company: user.company || '',
        planType: user.plan_type || 'free',
        messagesSent: user.messages_sent || 0,
        messageLimit: user.message_limit || 25,
        campaignsCreated: user.campaigns_created || 0,
        status: user.status || 'active',
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at || user.created_at,
        billingPeriod: user.billing_period || 'monthly',
        planAmount: user.plan_amount || 0
      }))
      
      setUsers(formattedUsers)
      setFilteredUsers(formattedUsers)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    let filtered = users

    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by plan type
    if (filterPlan !== 'all') {
      filtered = filtered.filter(user => user.planType.toLowerCase() === filterPlan.toLowerCase())
    }

    setFilteredUsers(filtered)
  }, [searchTerm, filterPlan, users])

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    const action = newStatus === 'suspended' ? 'suspend' : 'reactivate'
    
    if (!confirm(`Are you sure you want to ${action} this user account?`)) return
    
    try {
      await blink.db.users.update(userId, {
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      
      loadUsers()
      alert(`User account ${action}d successfully!`)
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Error updating user status. Please try again.')
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user account? This action cannot be undone.')) return
    
    try {
      // Delete user's campaigns first
      const userCampaigns = await blink.db.campaigns.list({
        where: { userId }
      })
      
      for (const campaign of userCampaigns) {
        await blink.db.campaigns.delete(campaign.id)
      }
      
      // Delete user's contacts
      const userContacts = await blink.db.contacts.list({
        where: { user_id: userId }
      })
      
      for (const contact of userContacts) {
        await blink.db.contacts.delete(contact.id)
      }
      
      // Finally delete the user
      await blink.db.users.delete(userId)
      
      loadUsers()
      alert('User account deleted successfully!')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user. Please try again.')
    }
  }

  const viewUserDetails = (user: UserData) => {
    setSelectedUser(user)
    setShowUserDetail(true)
  }

  const getPlanBadgeColor = (planType: string) => {
    switch (planType?.toLowerCase()) {
      case 'free': return 'bg-gray-100 text-gray-800'
      case 'starter': return 'bg-blue-100 text-blue-800'
      case 'professional': return 'bg-purple-100 text-purple-800'
      case 'enterprise': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate statistics
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.status === 'active').length
  const paidUsers = users.filter(u => u.planType !== 'free').length
  const totalRevenue = users.reduce((sum, u) => sum + (u.planAmount || 0), 0)

  if (showUserDetail && selectedUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Button variant="ghost" size="sm" onClick={() => setShowUserDetail(false)} className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Users
                </Button>
                <h1 className="text-2xl font-bold text-blue-600">User Details</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-6">
            {/* User Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    {selectedUser.fullName || 'User'} ({selectedUser.email})
                  </span>
                  <div className="flex space-x-2">
                    <Badge className={getStatusBadgeColor(selectedUser.status)}>
                      {selectedUser.status}
                    </Badge>
                    <Badge className={getPlanBadgeColor(selectedUser.planType)}>
                      {selectedUser.planType}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{selectedUser.email}</span>
                      </div>
                      {selectedUser.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{selectedUser.phone}</span>
                        </div>
                      )}
                      {selectedUser.company && (
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span>{selectedUser.company}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Account Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">User ID:</span>
                        <span className="font-mono text-sm">{selectedUser.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plan:</span>
                        <span>{selectedUser.planType} ({selectedUser.billingPeriod})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plan Amount:</span>
                        <span>${selectedUser.planAmount}/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Messages Used:</span>
                        <span>{selectedUser.messagesSent} / {selectedUser.messageLimit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Campaigns Created:</span>
                        <span>{selectedUser.campaignsCreated}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Since:</span>
                      <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Login:</span>
                      <span>{new Date(selectedUser.lastLoginAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-2">
                  <Button
                    variant={selectedUser.status === 'active' ? 'outline' : 'default'}
                    onClick={() => toggleUserStatus(selectedUser.id, selectedUser.status)}
                    className={selectedUser.status === 'active' ? 'text-red-600 border-red-300 hover:bg-red-50' : 'text-green-600 border-green-300 hover:bg-green-50'}
                  >
                    {selectedUser.status === 'active' ? (
                      <>
                        <Ban className="h-4 w-4 mr-2" />
                        Suspend Account
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Reactivate Account
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => deleteUser(selectedUser.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
                Back
              </Button>
              <h1 className="text-2xl font-bold text-blue-600">SmartBlasts</h1>
              <span className="ml-3 text-gray-500">Admin Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">Owner Access</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {activeUsers} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Users</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paidUsers}</div>
              <p className="text-xs text-muted-foreground">
                {totalUsers - paidUsers} on free plan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From {paidUsers} paid users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Free to paid conversion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by email, name, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Plans</option>
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterPlan !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'No users have signed up yet'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-900">User</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900">Plan</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900">Usage</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900">Campaigns</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900">Joined</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.fullName || 'N/A'}
                            </div>
                            <div className="text-gray-500">{user.email}</div>
                            {user.company && (
                              <div className="text-xs text-gray-400">{user.company}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getPlanBadgeColor(user.planType)}>
                            {user.planType}
                          </Badge>
                          {user.planAmount > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              ${user.planAmount}/{user.billingPeriod}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            {user.messagesSent} / {user.messageLimit}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ 
                                width: `${Math.min((user.messagesSent / user.messageLimit) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{user.campaignsCreated}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusBadgeColor(user.status)}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewUserDetails(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleUserStatus(user.id, user.status)}
                              className={user.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                            >
                              {user.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteUser(user.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard