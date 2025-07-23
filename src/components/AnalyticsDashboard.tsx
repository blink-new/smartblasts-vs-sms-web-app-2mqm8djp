import React, { useState, useEffect, useCallback } from 'react'
import { blink } from '../blink/client'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ArrowLeft, BarChart3, TrendingUp, Users, Send, Eye, Calendar } from 'lucide-react'

interface AnalyticsDashboardProps {
  user: any
  onBack: () => void
}

interface CampaignAnalytics {
  id: string
  name: string
  status: string
  totalContacts: number
  sentCount: number
  responseCount: number
  responseRate: number
  createdAt: string
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ user, onBack }) => {
  const [campaigns, setCampaigns] = useState<CampaignAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      
      // Load campaign data for analytics
      const campaignData = await blink.db.campaigns.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      
      // Filter by time range if needed
      let filteredCampaigns = campaignData
      if (timeRange !== 'all') {
        const daysAgo = parseInt(timeRange.replace('d', ''))
        const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
        filteredCampaigns = campaignData.filter(campaign => 
          new Date(campaign.created_at || campaign.createdAt) >= cutoffDate
        )
      }
      
      const formattedCampaigns = filteredCampaigns.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        totalContacts: campaign.total_contacts || campaign.totalContacts || 0,
        sentCount: campaign.sent_count || campaign.sentCount || 0,
        responseCount: campaign.response_count || campaign.responseCount || 0,
        responseRate: campaign.response_rate || campaign.responseRate || 0,
        createdAt: campaign.created_at || campaign.createdAt
      }))
      
      setCampaigns(formattedCampaigns)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id, timeRange])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  // Calculate aggregate metrics
  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const totalContacts = campaigns.reduce((sum, c) => sum + c.totalContacts, 0)
  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0)
  const totalResponses = campaigns.reduce((sum, c) => sum + c.responseCount, 0)
  const avgResponseRate = totalSent > 0 ? (totalResponses / totalSent * 100) : 0

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '7d': return 'Last 7 days'
      case '30d': return 'Last 30 days'
      case '90d': return 'Last 90 days'
      case 'all': return 'All time'
      default: return 'Last 30 days'
    }
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
              <h1 className="text-2xl font-bold text-blue-600">Analytics Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="all">All time</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading analytics...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Time Range Header */}
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Campaign Performance - {getTimeRangeLabel(timeRange)}
              </h2>
              <p className="text-gray-600 mt-1">
                Showing data for {totalCampaigns} campaigns
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCampaigns}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeCampaigns} currently active
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
                    Across all campaigns
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
                  <Send className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalResponses} responses received
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
                    Industry avg: 8-12%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Campaign Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance Breakdown</CardTitle>
                <p className="text-gray-600">Detailed metrics for each campaign</p>
              </CardHeader>
              <CardContent>
                {campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
                    <p className="text-gray-600">
                      No campaigns found for the selected time range. Try selecting a different time period.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Campaign</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">Contacts</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">Sent</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">Responses</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">Response Rate</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map((campaign) => (
                          <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900">{campaign.name}</div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge 
                                variant={campaign.status === 'active' ? 'default' : 
                                       campaign.status === 'paused' ? 'secondary' : 'outline'}
                              >
                                {campaign.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right font-medium">
                              {campaign.totalContacts.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-medium">
                              {campaign.sentCount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-medium">
                              {campaign.responseCount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-medium">
                              <span className={`${
                                campaign.sentCount > 0 && (campaign.responseCount / campaign.sentCount * 100) > 10
                                  ? 'text-green-600' 
                                  : campaign.sentCount > 0 && (campaign.responseCount / campaign.sentCount * 100) > 5
                                  ? 'text-yellow-600'
                                  : 'text-gray-600'
                              }`}>
                                {campaign.sentCount > 0 ? 
                                  ((campaign.responseCount / campaign.sentCount) * 100).toFixed(1) : 0}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-sm text-gray-500">
                              {new Date(campaign.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {avgResponseRate > 12 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800">🎉 Excellent Performance!</h4>
                      <p className="text-green-700 text-sm mt-1">
                        Your average response rate of {avgResponseRate.toFixed(1)}% is above industry average. Keep up the great work!
                      </p>
                    </div>
                  )}
                  
                  {avgResponseRate < 5 && totalSent > 50 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800">💡 Optimization Opportunity</h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        Your response rate of {avgResponseRate.toFixed(1)}% could be improved. Consider personalizing your messages more or reviewing your contact targeting.
                      </p>
                    </div>
                  )}
                  
                  {totalCampaigns === 0 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800">🚀 Get Started</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        Create your first campaign to start tracking performance metrics and analytics.
                      </p>
                    </div>
                  )}
                  
                  {activeCampaigns === 0 && totalCampaigns > 0 && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h4 className="font-semibold text-orange-800">⚠️ No Active Campaigns</h4>
                      <p className="text-orange-700 text-sm mt-1">
                        You have {totalCampaigns} campaigns but none are currently active. Activate campaigns to start sending messages.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalyticsDashboard