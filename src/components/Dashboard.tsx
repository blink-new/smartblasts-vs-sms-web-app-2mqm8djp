import React, { useState, useEffect } from 'react'
import { blink } from '../blink/client'
import { analyticsService } from '../services/analyticsService'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Alert, AlertDescription } from './ui/alert'
import { 
  Plus, 
  BarChart3, 
  Users, 
  Send, 
  TrendingUp, 
  LogOut, 
  ArrowLeft,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  Copy,
  Settings,
  Crown,
  MessageCircle,
  AlertTriangle
} from 'lucide-react'
import CampaignBuilder from './CampaignBuilder'
import ContactManagement from './ContactManagement'
import WhiteLabelManagement from './WhiteLabelManagement'
import TemplateManagement from './TemplateManagement'
import CampaignAutomation from './CampaignAutomation'
import AnalyticsDashboard from './AnalyticsDashboard'

interface DashboardProps {
  user: any
  onLogout: () => void
  onBackToLanding: () => void
  onUpgradeRequired?: () => void
  onGoToProfile?: () => void
  checkMessageLimit?: () => boolean
}

interface Campaign {
  id: string
  name: string
  description: string
  status: string
  totalContacts: number
  sentCount: number
  responseCount: number
  responseRate: number
  sendIntervalSeconds: number
  createdAt: string
  dripMessages?: string
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onBackToLanding, onUpgradeRequired, onGoToProfile, checkMessageLimit }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false)
  const [showContactManagement, setShowContactManagement] = useState(false)
  const [showWhiteLabelManagement, setShowWhiteLabelManagement] = useState(false)
  const [showTemplateManagement, setShowTemplateManagement] = useState(false)
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false)
  const [showCampaignAutomation, setShowCampaignAutomation] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const campaignData = await blink.db.campaigns.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      
      // Convert snake_case to camelCase and handle boolean fields
      const formattedCampaigns = campaignData.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        totalContacts: campaign.totalContacts || campaign.total_contacts || 0,
        sentCount: campaign.sentCount || campaign.sent_count || 0,
        responseCount: campaign.responseCount || campaign.response_count || 0,
        responseRate: campaign.responseRate || campaign.response_rate || 0,
        sendIntervalSeconds: campaign.sendIntervalSeconds || campaign.send_interval_seconds || 10,
        createdAt: campaign.createdAt || campaign.created_at,
        // FIXED: Pass both snake_case and camelCase for compatibility
        drip_messages: campaign.dripMessages || campaign.drip_messages,
        dripMessages: campaign.dripMessages || campaign.drip_messages
      }))
      
      setCampaigns(formattedCampaigns)
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCampaigns()
    // Track page view
    analyticsService.trackPageView(user.id, 'dashboard')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCampaignCreated = () => {
    setShowCampaignBuilder(false)
    loadCampaigns()
  }

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This will also delete all associated contacts.')) return
    
    try {
      // First, delete all associated contacts to avoid foreign key constraint
      const existingContacts = await blink.db.campaignContacts.list({
        where: { campaignId }
      })
      
      // Delete each contact individually
      for (const contact of existingContacts) {
        await blink.db.campaignContacts.delete(contact.id)
      }
      
      // Now we can safely delete the campaign
      await blink.db.campaigns.delete(campaignId)
      
      loadCampaigns()
    } catch (error) {
      console.error('Error deleting campaign:', error)
      alert('Failed to delete campaign. Please try again.')
    }
  }

  const toggleCampaignStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active'
    
    try {
      await blink.db.campaigns.update(campaign.id, { status: newStatus })
      loadCampaigns()
    } catch (error) {
      console.error('Error updating campaign status:', error)
      alert('Failed to update campaign status. Please try again.')
    }
  }

  const cloneCampaign = async (campaign: Campaign) => {
    if (!confirm(`Are you sure you want to clone "${campaign.name}"? This will create a copy with all drip messages and contacts.`)) return
    
    try {
      // Create new campaign with cloned data
      const newCampaignId = `campaign_${Date.now()}`
      const clonedName = `${campaign.name} (Copy)`
      
      // Get the original campaign data to access drip messages
      const originalCampaignData = await blink.db.campaigns.list({
        where: { id: campaign.id, userId: user.id }
      })
      
      if (originalCampaignData.length === 0) {
        alert('Original campaign not found.')
        return
      }
      
      const originalCampaign = originalCampaignData[0]
      
      await blink.db.campaigns.create({
        id: newCampaignId,
        userId: user.id,
        name: clonedName,
        description: `${campaign.description} (Cloned)`,
        status: 'draft', // Always start cloned campaigns as draft
        dripMessages: originalCampaign.drip_messages, // Copy drip messages
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalContacts: 0, // Start with 0 contacts, user can add them
        sentCount: 0,
        responseCount: 0,
        responseRate: 0.0
      })
      
      // Optionally clone contacts as well
      const shouldCloneContacts = confirm('Do you also want to clone all contacts from the original campaign?')
      
      if (shouldCloneContacts) {
        const originalContacts = await blink.db.campaignContacts.list({
          where: { campaignId: campaign.id }
        })
        
        for (const contact of originalContacts) {
          await blink.db.campaignContacts.create({
            id: `contact_${newCampaignId}_${Date.now()}_${Math.random()}`,
            campaignId: newCampaignId,
            userId: user.id,
            companyName: contact.company_name,
            contactName: contact.contact_name,
            email: contact.email,
            website: contact.website,
            status: 'pending',
            createdAt: new Date().toISOString()
          })
        }
        
        // Update contact count
        await blink.db.campaigns.update(newCampaignId, {
          totalContacts: originalContacts.length
        })
      }
      
      loadCampaigns()
      alert(`Campaign "${clonedName}" has been created successfully!`)
    } catch (error) {
      console.error('Error cloning campaign:', error)
      alert('Failed to clone campaign. Please try again.')
    }
  }

  // Calculate dashboard stats
  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const totalContacts = campaigns.reduce((sum, c) => sum + c.totalContacts, 0)
  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0)
  const totalResponses = campaigns.reduce((sum, c) => sum + c.responseCount, 0)
  const avgResponseRate = totalSent > 0 ? (totalResponses / totalSent * 100) : 0

  if (showCampaignBuilder) {
    return (
      <CampaignBuilder
        user={user}
        campaign={selectedCampaign}
        onBack={() => {
          setShowCampaignBuilder(false)
          setSelectedCampaign(null)
        }}
        onSave={handleCampaignCreated}
      />
    )
  }

  if (showContactManagement) {
    return (
      <ContactManagement
        user={user}
        onBack={() => setShowContactManagement(false)}
      />
    )
  }

  if (showWhiteLabelManagement) {
    return (
      <WhiteLabelManagement
        user={user}
        onBack={() => setShowWhiteLabelManagement(false)}
      />
    )
  }

  if (showTemplateManagement) {
    return (
      <TemplateManagement
        user={user}
        onBack={() => setShowTemplateManagement(false)}
      />
    )
  }

  if (showAnalyticsDashboard) {
    return (
      <AnalyticsDashboard
        user={user}
        onBack={() => setShowAnalyticsDashboard(false)}
      />
    )
  }

  if (showCampaignAutomation) {
    return (
      <CampaignAutomation
        user={user}
        onBack={() => setShowCampaignAutomation(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToLanding}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Landing
              </Button>
              <h1 className="text-2xl font-bold text-blue-600">SmartBlasts</h1>
              <span className="ml-3 text-gray-500">Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => setShowWhiteLabelManagement(true)}>
                <Crown className="h-4 w-4 mr-2" />
                White Label
              </Button>
              <div className="text-sm text-gray-600">
                <div>Welcome, {user.fullName || user.email}</div>
                <div className="text-xs">
                  {user.messagesSent}/{user.messageLimit} messages used
                  {user.planType && ` (${user.planType} plan)`}
                </div>
              </div>
              {onGoToProfile && (
                <Button variant="outline" size="sm" onClick={onGoToProfile}>
                  <Settings className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Limit Warning */}
        {user.messagesSent >= user.messageLimit * 0.8 && (
          <Alert className={`mb-6 ${user.messagesSent >= user.messageLimit ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className={user.messagesSent >= user.messageLimit ? 'text-red-800' : 'text-orange-800'}>
              {user.messagesSent >= user.messageLimit ? (
                <>
                  <strong>Message limit reached!</strong> You've used all {user.messageLimit} messages in your {user.planType} plan. 
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-semibold text-red-700 hover:text-red-800 ml-1"
                    onClick={onUpgradeRequired}
                  >
                    Upgrade now to continue sending campaigns.
                  </Button>
                </>
              ) : (
                <>
                  <strong>Approaching message limit:</strong> You've used {user.messagesSent} of {user.messageLimit} messages ({Math.round((user.messagesSent / user.messageLimit) * 100)}%). 
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-semibold text-orange-700 hover:text-orange-800 ml-1"
                    onClick={onUpgradeRequired}
                  >
                    Consider upgrading your plan.
                  </Button>
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                {activeCampaigns} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalContacts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {totalSent} messages sent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalResponses}</div>
              <p className="text-xs text-muted-foreground">
                From {totalSent} sent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgResponseRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Industry avg: 8%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
            </TabsList>
            
            <Button onClick={() => setShowCampaignBuilder(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>

          <TabsContent value="campaigns" className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading campaigns...</p>
              </div>
            ) : campaigns.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
                  <p className="text-gray-600 mb-6">
                    Create your first contact form outreach campaign to get started.
                  </p>
                  <Button onClick={() => setShowCampaignBuilder(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Campaign
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{campaign.name}</CardTitle>
                          <p className="text-gray-600 mt-1">{campaign.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={campaign.status === 'active' ? 'default' : 
                                   campaign.status === 'paused' ? 'secondary' : 'outline'}
                          >
                            {campaign.status}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCampaign(campaign)
                                setShowCampaignBuilder(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCampaign(campaign)
                                setShowCampaignBuilder(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCampaignStatus(campaign)}
                            >
                              {campaign.status === 'active' ? 
                                <Pause className="h-4 w-4" /> : 
                                <Play className="h-4 w-4" />
                              }
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cloneCampaign(campaign)}
                              title="Clone Campaign"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCampaign(campaign.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Contacts</p>
                          <p className="text-lg font-semibold">{campaign.totalContacts}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Sent</p>
                          <p className="text-lg font-semibold">{campaign.sentCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Responses</p>
                          <p className="text-lg font-semibold">{campaign.responseCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Response Rate</p>
                          <p className="text-lg font-semibold">
                            {campaign.sentCount > 0 ? 
                              ((campaign.responseCount / campaign.sentCount) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-xs text-gray-500">
                          Created {new Date(campaign.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Message Templates</span>
                  <Button onClick={() => setShowTemplateManagement(true)}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Manage Templates
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Template Library</h3>
                  <p className="text-gray-600 mb-6">
                    Create reusable message templates for your drip campaigns. Save time by using 
                    pre-written templates for different types of outreach.
                  </p>
                  <Button onClick={() => setShowTemplateManagement(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Open Template Manager
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Analytics & Performance</span>
                  <Button onClick={() => setShowAnalyticsDashboard(true)}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Full Analytics
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Analytics Dashboard</h3>
                  <p className="text-gray-600 mb-6">
                    Track your campaign performance, user activity, and engagement metrics with comprehensive analytics.
                  </p>
                  <Button onClick={() => setShowAnalyticsDashboard(true)}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Open Analytics Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Contact Management</span>
                  <Button onClick={() => setShowContactManagement(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Contacts
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Centralized Contact Management</h3>
                  <p className="text-gray-600 mb-6">
                    Manage all your contacts in one place. Add contacts manually, import from CSV, 
                    and automatically remove duplicates.
                  </p>
                  <Button onClick={() => setShowContactManagement(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Open Contact Manager
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Campaign Automation</span>
                  <Button onClick={() => setShowCampaignAutomation(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Automation
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Campaign Automation</h3>
                  <p className="text-gray-600 mb-6">
                    Set up automated rules to streamline your campaign management. Schedule campaigns, 
                    create follow-up sequences, and trigger actions based on responses.
                  </p>
                  <Button onClick={() => setShowCampaignAutomation(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Open Automation Manager
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Dashboard