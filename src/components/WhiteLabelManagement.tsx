import React, { useState, useEffect } from 'react'
import { blink } from '../blink/client'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Users,
  Settings,
  Crown,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  CreditCard,
  Calendar,
  Phone,
  Globe,
  MessageCircle,
  BarChart3
} from 'lucide-react'

interface WhiteLabelManagementProps {
  user: any
  onBack: () => void
}

interface Vendor {
  id: string
  ownerID: string
  vendorEmail: string
  vendorName: string
  phoneNumber?: string
  website?: string
  paymentPlatform?: string
  signupDate?: string
  membershipEndDate?: string
  status: string
  createdAt: string
  updatedAt: string
}

interface VendorStats {
  vendorId: string
  messagesSent: number
  campaignsCreated: number
  lastActivity?: string
}

interface Subscription {
  id: string
  vendorId: string
  planType: string
  status: string
  amount: number
  currentPeriodStart?: string
  currentPeriodEnd?: string
}

const WhiteLabelManagement: React.FC<WhiteLabelManagementProps> = ({ user, onBack }) => {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorStats, setVendorStats] = useState<Record<string, VendorStats>>({})
  const [subscriptions, setSubscriptions] = useState<Record<string, Subscription>>({})
  const [loading, setLoading] = useState(true)
  const [addingVendor, setAddingVendor] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [newVendor, setNewVendor] = useState({
    vendorEmail: '',
    vendorName: '',
    phoneNumber: '',
    website: '',
    paymentPlatform: 'stripe',
    planType: 'monthly'
  })

  const loadVendors = async () => {
    try {
      setLoading(true)
      const vendorData = await blink.db.whiteLabelVendors.list({
        where: { owner_id: user.id },
        orderBy: { created_at: 'desc' }
      })
      
      const formattedVendors = vendorData.map((vendor: any) => ({
        id: vendor.id,
        ownerID: vendor.owner_id,
        vendorEmail: vendor.vendor_email,
        vendorName: vendor.vendor_name || '',
        phoneNumber: vendor.phone_number || '',
        website: vendor.website || '',
        paymentPlatform: vendor.payment_platform || 'stripe',
        signupDate: vendor.signup_date || vendor.created_at,
        membershipEndDate: vendor.membership_end_date,
        status: vendor.status,
        createdAt: vendor.created_at,
        updatedAt: vendor.updated_at
      }))
      
      setVendors(formattedVendors)
      
      // Load vendor stats
      const statsData = await blink.db.vendorStats.list({
        where: { user_id: user.id }
      })
      
      const statsMap: Record<string, VendorStats> = {}
      statsData.forEach((stat: any) => {
        statsMap[stat.vendor_id] = {
          vendorId: stat.vendor_id,
          messagesSent: stat.messages_sent || 0,
          campaignsCreated: stat.campaigns_created || 0,
          lastActivity: stat.last_activity
        }
      })
      setVendorStats(statsMap)
      
      // Load subscriptions
      const subscriptionData = await blink.db.subscriptions.list({
        where: { user_id: user.id }
      })
      
      const subscriptionMap: Record<string, Subscription> = {}
      subscriptionData.forEach((sub: any) => {
        subscriptionMap[sub.vendor_id] = {
          id: sub.id,
          vendorId: sub.vendor_id,
          planType: sub.plan_type,
          status: sub.status,
          amount: sub.amount,
          currentPeriodStart: sub.current_period_start,
          currentPeriodEnd: sub.current_period_end
        }
      })
      setSubscriptions(subscriptionMap)
      
    } catch (error) {
      console.error('Error loading vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVendors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleVendorChange = (field: string, value: string) => {
    setNewVendor(prev => ({ ...prev, [field]: value }))
  }

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }



  const addVendor = async () => {
    console.log('🚀 Add vendor button clicked!')
    console.log('👤 Current user:', user)
    console.log('📝 New vendor data:', newVendor)
    
    // Validate required fields
    if (!newVendor.vendorEmail || !newVendor.vendorName) {
      console.error('❌ Missing required fields')
      alert('Please enter vendor email and name')
      return
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newVendor.vendorEmail)) {
      console.error('❌ Invalid email format')
      alert('Please enter a valid email address')
      return
    }
    
    // Check for duplicates
    const existingEmails = vendors.map(v => v.vendorEmail.toLowerCase())
    if (existingEmails.includes(newVendor.vendorEmail.toLowerCase())) {
      console.error('❌ Duplicate email found')
      alert('This vendor email already exists')
      return
    }
    
    // Check authentication
    if (!user || !user.id) {
      console.error('❌ User not authenticated')
      alert('You must be logged in to add vendors. Please refresh the page and try again.')
      return
    }
    
    console.log('✅ All validations passed, starting vendor creation...')
    setAddingVendor(true)
    
    try {
      // Test database connection first
      console.log('🔍 Testing database connection...')
      const testQuery = await blink.db.whiteLabelVendors.list({ limit: 1 })
      console.log('✅ Database connection successful:', testQuery)
      
      const vendorId = `vendor_${Date.now()}`
      const password = generateRandomPassword()
      const signupDate = new Date().toISOString()
      
      console.log('🆔 Generated vendor ID:', vendorId)
      console.log('🔐 Generated password:', password)
      console.log('📅 Signup date:', signupDate)
      
      // Calculate membership end date based on plan
      const membershipEndDate = new Date()
      if (newVendor.planType === 'yearly') {
        membershipEndDate.setFullYear(membershipEndDate.getFullYear() + 1)
      } else {
        membershipEndDate.setMonth(membershipEndDate.getMonth() + 1)
      }
      console.log('📅 Membership end date:', membershipEndDate.toISOString())
      
      console.log('📝 Creating vendor record...')
      // Create vendor with explicit field mapping
      const vendorData = {
        id: vendorId,
        owner_id: user.id,
        vendor_email: newVendor.vendorEmail,
        vendor_name: newVendor.vendorName,
        phone_number: newVendor.phoneNumber || '',
        website: newVendor.website || '',
        payment_platform: newVendor.paymentPlatform,
        signup_date: signupDate,
        membership_end_date: membershipEndDate.toISOString(),
        status: 'active',
        created_at: signupDate,
        updated_at: signupDate
      }
      console.log('📋 Vendor data to create:', vendorData)
      
      const vendorRecord = await blink.db.whiteLabelVendors.create(vendorData)
      console.log('✅ Vendor record created:', vendorRecord)
      
      console.log('📊 Creating vendor stats...')
      const statsData = {
        id: `stats_${vendorId}`,
        vendor_id: vendorId,
        user_id: user.id,
        messages_sent: 0,
        campaigns_created: 0,
        created_at: signupDate,
        updated_at: signupDate
      }
      console.log('📋 Stats data to create:', statsData)
      
      const statsRecord = await blink.db.vendorStats.create(statsData)
      console.log('✅ Vendor stats created:', statsRecord)
      
      console.log('💳 Creating subscription...')
      const amount = newVendor.planType === 'yearly' ? 97 * 12 * 100 : 97 * 100 // in cents
      const subscriptionData = {
        id: `sub_${vendorId}`,
        vendor_id: vendorId,
        user_id: user.id,
        plan_type: newVendor.planType,
        status: 'active',
        amount: amount,
        currency: 'usd',
        current_period_start: signupDate,
        current_period_end: membershipEndDate.toISOString(),
        created_at: signupDate,
        updated_at: signupDate
      }
      console.log('📋 Subscription data to create:', subscriptionData)
      
      const subscriptionRecord = await blink.db.subscriptions.create(subscriptionData)
      console.log('✅ Subscription created:', subscriptionRecord)
      
      // Reset form
      console.log('🔄 Resetting form...')
      setNewVendor({
        vendorEmail: '',
        vendorName: '',
        phoneNumber: '',
        website: '',
        paymentPlatform: 'stripe',
        planType: 'monthly'
      })
      
      // Reload vendors
      console.log('🔄 Reloading vendors list...')
      await loadVendors()
      
      console.log('🎉 Vendor creation completed successfully!')
      alert(`✅ Vendor added successfully! ${newVendor.vendorName} has been added to your white label system.`)
    } catch (error) {
      console.error('❌ Error adding vendor:', error)
      console.error('❌ Error message:', error?.message || 'Unknown error')
      console.error('❌ Error stack:', error?.stack || 'No stack trace')
      
      // More specific error handling
      let errorMessage = 'Unknown error occurred'
      if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      alert(`❌ Error adding vendor: ${errorMessage}\n\nPlease check the browser console for more details and try again.`)
    } finally {
      console.log('🏁 Cleaning up...')
      setAddingVendor(false)
    }
  }

  const updateVendorStatus = async (vendorId: string, newStatus: string) => {
    try {
      await blink.db.whiteLabelVendors.update(vendorId, {
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      
      // Update subscription status
      if (subscriptions[vendorId]) {
        await blink.db.subscriptions.update(subscriptions[vendorId].id, {
          status: newStatus === 'active' ? 'active' : 'cancelled',
          updated_at: new Date().toISOString()
        })
      }
      
      loadVendors()
      alert(`Vendor ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`)
    } catch (error) {
      console.error('Error updating vendor status:', error)
      alert('Error updating vendor status. Please try again.')
    }
  }

  const removeVendor = async (vendorId: string) => {
    if (!confirm('Are you sure you want to remove this vendor? This will cancel their membership and delete all their data.')) return
    
    try {
      // Delete subscription
      if (subscriptions[vendorId]) {
        await blink.db.subscriptions.delete(subscriptions[vendorId].id)
      }
      
      // Delete vendor stats
      if (vendorStats[vendorId]) {
        await blink.db.vendorStats.delete(`stats_${vendorId}`)
      }
      
      // Delete vendor
      await blink.db.whiteLabelVendors.delete(vendorId)
      
      loadVendors()
      alert('Vendor removed successfully!')
    } catch (error) {
      console.error('Error removing vendor:', error)
      alert('Error removing vendor. Please try again.')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case 'suspended':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Suspended</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPlanBadge = (planType: string, amount: number) => {
    const monthlyAmount = planType === 'yearly' ? Math.round(amount / 12 / 100) : Math.round(amount / 100)
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-800">
        <CreditCard className="h-3 w-3 mr-1" />
        ${monthlyAmount}/mo {planType === 'yearly' && '(Yearly)'}
      </Badge>
    )
  }

  const activeVendors = vendors.filter(v => v.status === 'active').length
  const suspendedVendors = vendors.filter(v => v.status === 'suspended').length
  const totalRevenue = Object.values(subscriptions)
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => sum + (sub.planType === 'yearly' ? sub.amount / 12 : sub.amount), 0) / 100

  const totalMessagesSent = Object.values(vendorStats).reduce((sum, stats) => sum + stats.messagesSent, 0)
  const totalCampaigns = Object.values(vendorStats).reduce((sum, stats) => sum + stats.campaignsCreated, 0)

  // Vendor Detail View Component
  const VendorDetailView = ({ vendor }: { vendor: Vendor }) => {
    const stats = vendorStats[vendor.id] || { messagesSent: 0, campaignsCreated: 0 }
    const subscription = subscriptions[vendor.id]
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedVendor(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vendors
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{vendor.vendorName}</h2>
              <p className="text-gray-600">Vendor Details</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(vendor.status)}
            {subscription && getPlanBadge(subscription.planType, subscription.amount)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                <p className="text-lg font-semibold">{vendor.vendorName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Email Address</Label>
                <div className="flex items-center space-x-2">
                  <p className="text-lg">{vendor.vendorEmail}</p>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`mailto:${vendor.vendorEmail}`}>
                      <Mail className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
              {vendor.phoneNumber && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg">{vendor.phoneNumber}</p>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`tel:${vendor.phoneNumber}`}>
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
              {vendor.website && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Website</Label>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg">{vendor.website}</p>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`https://${vendor.website}`} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-gray-600">Vendor ID</Label>
                <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{vendor.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription ? (
                <>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Plan Type</Label>
                    <p className="text-lg font-semibold capitalize">{subscription.planType}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Monthly Amount</Label>
                    <p className="text-lg font-semibold text-green-600">
                      ${subscription.planType === 'yearly' ? Math.round(subscription.amount / 12 / 100) : Math.round(subscription.amount / 100)}/month
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Payment Platform</Label>
                    <p className="text-lg capitalize">{vendor.paymentPlatform}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Subscription Status</Label>
                    <Badge className={subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {subscription.status}
                    </Badge>
                  </div>
                  {subscription.currentPeriodStart && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Current Period</Label>
                      <p className="text-sm">
                        {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {' '}
                        {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No subscription found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Messages Sent</Label>
                <p className="text-2xl font-bold text-blue-600">{stats.messagesSent.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Campaigns Created</Label>
                <p className="text-2xl font-bold text-green-600">{stats.campaignsCreated}</p>
              </div>
              {stats.lastActivity && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Activity</Label>
                  <p className="text-sm">{new Date(stats.lastActivity).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-gray-600">Account Status</Label>
                {getStatusBadge(vendor.status)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Membership Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Membership Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-600">Signup Date</Label>
                <p className="text-lg font-semibold">
                  {new Date(vendor.signupDate || vendor.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  {Math.floor((Date.now() - new Date(vendor.signupDate || vendor.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                </p>
              </div>
              {vendor.membershipEndDate && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Membership Expires</Label>
                  <p className="text-lg font-semibold">
                    {new Date(vendor.membershipEndDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {Math.ceil((new Date(vendor.membershipEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                  </p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                <p className="text-lg font-semibold">
                  {new Date(vendor.updatedAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  {Math.floor((Date.now() - new Date(vendor.updatedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(`mailto:${vendor.vendorEmail}`, '_blank')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              {vendor.status === 'active' ? (
                <Button
                  variant="outline"
                  onClick={() => updateVendorStatus(vendor.id, 'suspended')}
                  className="text-yellow-600 hover:text-yellow-700"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Suspend Vendor
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => updateVendorStatus(vendor.id, 'active')}
                  className="text-green-600 hover:text-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activate Vendor
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => removeVendor(vendor.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Vendor
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If a vendor is selected, show the detail view
  if (selectedVendor) {
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
                <h1 className="text-2xl font-bold text-blue-600">SmartBlasts</h1>
                <span className="ml-3 text-gray-500 flex items-center">
                  <Crown className="h-4 w-4 mr-1" />
                  White Label Management
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <VendorDetailView vendor={selectedVendor} />
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
              <h1 className="text-2xl font-bold text-blue-600">SmartBlasts</h1>
              <span className="ml-3 text-gray-500 flex items-center">
                <Crown className="h-4 w-4 mr-1" />
                White Label Management
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendors.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeVendors} active • {suspendedVendors} suspended
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <Crown className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From active subscriptions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              <MessageCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalMessagesSent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                By all vendors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                Created by vendors
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="vendors" className="space-y-6">
          <TabsList>
            <TabsTrigger value="vendors">Vendor Management</TabsTrigger>
            <TabsTrigger value="settings">White Label Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="vendors" className="space-y-6">
            {/* Add Vendor Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Vendor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="vendorEmail">Vendor Email *</Label>
                    <Input
                      id="vendorEmail"
                      type="email"
                      value={newVendor.vendorEmail}
                      onChange={(e) => handleVendorChange('vendorEmail', e.target.value)}
                      placeholder="vendor@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendorName">Vendor Name *</Label>
                    <Input
                      id="vendorName"
                      value={newVendor.vendorName}
                      onChange={(e) => handleVendorChange('vendorName', e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={newVendor.phoneNumber}
                      onChange={(e) => handleVendorChange('phoneNumber', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={newVendor.website}
                      onChange={(e) => handleVendorChange('website', e.target.value)}
                      placeholder="company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentPlatform">Payment Platform</Label>
                    <Select value={newVendor.paymentPlatform} onValueChange={(value) => handleVendorChange('paymentPlatform', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="planType">Plan Type</Label>
                    <Select value={newVendor.planType} onValueChange={(value) => handleVendorChange('planType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly ($97/mo)</SelectItem>
                        <SelectItem value="yearly">Yearly ($97/mo, billed annually)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Vendor Account</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        The vendor will be added to your white label system with an active subscription and full access to create campaigns.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={addVendor} 
                    disabled={!newVendor.vendorEmail || !newVendor.vendorName || addingVendor}
                    className="flex-1 sm:flex-none"
                  >
                    {addingVendor ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding Vendor...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Vendor
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={async () => {
                      console.log('🧪 Testing connection...')
                      try {
                        console.log('👤 Current user:', user)
                        const testResult = await blink.db.whiteLabelVendors.list({ limit: 1 })
                        console.log('✅ Database test successful:', testResult)
                        alert('✅ Connection test successful! Check console for details.')
                      } catch (error) {
                        console.error('❌ Connection test failed:', error)
                        alert('❌ Connection test failed! Check console for details.')
                      }
                    }}
                    className="sm:w-auto"
                  >
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Vendors List */}
            <Card>
              <CardHeader>
                <CardTitle>All Vendors ({vendors.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading vendors...</p>
                  </div>
                ) : vendors.length === 0 ? (
                  <div className="text-center py-12">
                    <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No vendors yet</h3>
                    <p className="text-gray-600 mb-6">
                      Add your first white label vendor to get started.
                    </p>
                    <Button onClick={() => document.getElementById('vendorEmail')?.focus()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Vendor
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium">Vendor</th>
                          <th className="px-4 py-3 text-left font-medium">Contact</th>
                          <th className="px-4 py-3 text-left font-medium">Plan</th>
                          <th className="px-4 py-3 text-left font-medium">Usage</th>
                          <th className="px-4 py-3 text-left font-medium">Membership</th>
                          <th className="px-4 py-3 text-left font-medium">Status</th>
                          <th className="px-4 py-3 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {vendors.map((vendor) => {
                          const stats = vendorStats[vendor.id] || { messagesSent: 0, campaignsCreated: 0 }
                          const subscription = subscriptions[vendor.id]
                          
                          return (
                            <tr key={vendor.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4">
                                <div>
                                  <button
                                    onClick={() => setSelectedVendor(vendor)}
                                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                                  >
                                    {vendor.vendorName}
                                  </button>
                                  <div className="text-gray-500 text-xs">ID: {vendor.id}</div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="space-y-1">
                                  <div className="flex items-center text-sm">
                                    <Mail className="h-3 w-3 mr-1 text-gray-400" />
                                    <a href={`mailto:${vendor.vendorEmail}`} className="text-blue-600 hover:underline">
                                      {vendor.vendorEmail}
                                    </a>
                                  </div>
                                  {vendor.phoneNumber && (
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Phone className="h-3 w-3 mr-1 text-gray-400" />
                                      {vendor.phoneNumber}
                                    </div>
                                  )}
                                  {vendor.website && (
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Globe className="h-3 w-3 mr-1 text-gray-400" />
                                      <a href={`https://${vendor.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {vendor.website}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="space-y-1">
                                  {subscription && getPlanBadge(subscription.planType, subscription.amount)}
                                  <div className="flex items-center text-xs text-gray-500">
                                    <CreditCard className="h-3 w-3 mr-1" />
                                    {vendor.paymentPlatform}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="space-y-1">
                                  <div className="text-sm">
                                    <MessageCircle className="h-3 w-3 inline mr-1" />
                                    {stats.messagesSent} messages
                                  </div>
                                  <div className="text-sm">
                                    <BarChart3 className="h-3 w-3 inline mr-1" />
                                    {stats.campaignsCreated} campaigns
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="space-y-1">
                                  <div className="flex items-center text-xs text-gray-600">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Joined: {new Date(vendor.signupDate || vendor.createdAt).toLocaleDateString()}
                                  </div>
                                  {vendor.membershipEndDate && (
                                    <div className="flex items-center text-xs text-gray-600">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Expires: {new Date(vendor.membershipEndDate).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                {getStatusBadge(vendor.status)}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center space-x-2">
                                  {vendor.status === 'active' ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateVendorStatus(vendor.id, 'suspended')}
                                      className="text-yellow-600 hover:text-yellow-700"
                                    >
                                      <AlertCircle className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateVendorStatus(vendor.id, 'active')}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeVendor(vendor.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>White Label Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Crown className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">White Label Features</h3>
                      <ul className="text-sm text-blue-800 space-y-2">
                        <li>• Vendors can create their own campaigns under your brand</li>
                        <li>• Each vendor has their own isolated workspace</li>
                        <li>• You maintain full control over vendor access</li>
                        <li>• Automatic welcome emails with login credentials</li>
                        <li>• All vendor data is kept separate and secure</li>
                        <li>• Comprehensive usage tracking and analytics</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-900 mb-2">Revenue Model</h3>
                      <ul className="text-sm text-green-800 space-y-2">
                        <li>• Monthly Plan: $97/month per vendor</li>
                        <li>• Yearly Plan: $97/month (billed annually)</li>
                        <li>• Automatic billing and subscription management</li>
                        <li>• Support for Stripe and PayPal payments</li>
                        <li>• You keep 100% of vendor subscription fees</li>
                        <li>• Suspended vendors don't generate revenue</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Settings className="h-6 w-6 text-yellow-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-900 mb-2">Management Actions</h3>
                      <ul className="text-sm text-yellow-800 space-y-2">
                        <li>• <strong>Active:</strong> Vendor can use all features and create campaigns</li>
                        <li>• <strong>Suspended:</strong> Vendor access is temporarily disabled</li>
                        <li>• <strong>Remove:</strong> Permanently delete vendor and cancel their membership</li>
                        <li>• <strong>Welcome Email:</strong> Automatically sent with credentials and tutorial</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-6 w-6 text-purple-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-purple-900 mb-2">Welcome Email Features</h3>
                      <ul className="text-sm text-purple-800 space-y-2">
                        <li>• Automatically generated secure password</li>
                        <li>• Direct link to your SmartBlasts platform</li>
                        <li>• Embedded tutorial video for quick onboarding</li>
                        <li>• Professional branded email template</li>
                        <li>• Security reminder to change password</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default WhiteLabelManagement