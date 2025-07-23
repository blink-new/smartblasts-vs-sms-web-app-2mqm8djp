import React, { useState, useEffect, useCallback } from 'react'
import { blink } from '../blink/client'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Settings, 
  Clock, 
  Send, 
  Users, 
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Mail
} from 'lucide-react'

interface CampaignAutomationProps {
  user: any
  onBack: () => void
}

interface AutomationRule {
  id: string
  name: string
  description: string
  triggerType: 'time_based' | 'response_based' | 'manual'
  isActive: boolean
  campaignId: string
  conditions: any
  actions: any
  createdAt: string
}

const CampaignAutomation: React.FC<CampaignAutomationProps> = ({ user, onBack }) => {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateRule, setShowCreateRule] = useState(false)
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    triggerType: 'time_based' as const,
    campaignId: '',
    scheduleTime: '',
    scheduleDate: '',
    followUpDelay: 24,
    conditions: {
      noResponse: true,
      responseReceived: false
    }
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Load campaigns
      const campaignData = await blink.db.campaigns.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setCampaigns(campaignData)

      // Load automation rules (create table if doesn't exist)
      try {
        const rulesData = await blink.db.automationRules.list({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        })
        setAutomationRules(rulesData)
      } catch (error) {
        // Table might not exist, create it
        console.log('Creating automation rules table...')
        setAutomationRules([])
      }
    } catch (error) {
      console.error('Error loading automation data:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const createAutomationRule = async () => {
    if (!newRule.name || !newRule.campaignId) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const ruleId = `rule_${Date.now()}`
      
      // Create the automation rule
      await blink.db.automationRules.create({
        id: ruleId,
        userId: user.id,
        name: newRule.name,
        description: newRule.description,
        triggerType: newRule.triggerType,
        campaignId: newRule.campaignId,
        isActive: true,
        conditions: JSON.stringify(newRule.conditions),
        actions: JSON.stringify({
          scheduleTime: newRule.scheduleTime,
          scheduleDate: newRule.scheduleDate,
          followUpDelay: newRule.followUpDelay
        }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // Reset form
      setNewRule({
        name: '',
        description: '',
        triggerType: 'time_based',
        campaignId: '',
        scheduleTime: '',
        scheduleDate: '',
        followUpDelay: 24,
        conditions: {
          noResponse: true,
          responseReceived: false
        }
      })

      setShowCreateRule(false)
      loadData()
      alert('Automation rule created successfully!')
    } catch (error) {
      console.error('Error creating automation rule:', error)
      alert('Failed to create automation rule. Please try again.')
    }
  }

  const toggleRuleStatus = async (ruleId: string, currentStatus: boolean) => {
    try {
      await blink.db.automationRules.update(ruleId, {
        isActive: !currentStatus,
        updatedAt: new Date().toISOString()
      })
      loadData()
    } catch (error) {
      console.error('Error updating rule status:', error)
      alert('Failed to update rule status.')
    }
  }

  const deleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) return

    try {
      await blink.db.automationRules.delete(ruleId)
      loadData()
    } catch (error) {
      console.error('Error deleting rule:', error)
      alert('Failed to delete rule.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading automation settings...</p>
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
              <h1 className="text-2xl font-bold text-blue-600">Campaign Automation</h1>
            </div>
            
            <Button onClick={() => setShowCreateRule(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Create Automation Rule
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showCreateRule ? (
          <Card>
            <CardHeader>
              <CardTitle>Create New Automation Rule</CardTitle>
              <p className="text-gray-600">Set up automated actions for your campaigns</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ruleName">Rule Name *</Label>
                    <Input
                      id="ruleName"
                      value={newRule.name}
                      onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Daily Follow-up Sequence"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="campaignSelect">Campaign *</Label>
                    <select
                      id="campaignSelect"
                      value={newRule.campaignId}
                      onChange={(e) => setNewRule(prev => ({ ...prev, campaignId: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Select a campaign</option>
                      {campaigns.map(campaign => (
                        <option key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ruleDescription">Description</Label>
                  <Textarea
                    id="ruleDescription"
                    value={newRule.description}
                    onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this automation rule does..."
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Trigger Type</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className={`cursor-pointer border-2 ${newRule.triggerType === 'time_based' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                          onClick={() => setNewRule(prev => ({ ...prev, triggerType: 'time_based' }))}>
                      <CardContent className="p-4 text-center">
                        <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <h3 className="font-semibold">Time-Based</h3>
                        <p className="text-sm text-gray-600">Schedule at specific times</p>
                      </CardContent>
                    </Card>

                    <Card className={`cursor-pointer border-2 ${newRule.triggerType === 'response_based' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                          onClick={() => setNewRule(prev => ({ ...prev, triggerType: 'response_based' }))}>
                      <CardContent className="p-4 text-center">
                        <Mail className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <h3 className="font-semibold">Response-Based</h3>
                        <p className="text-sm text-gray-600">Trigger on responses</p>
                      </CardContent>
                    </Card>

                    <Card className={`cursor-pointer border-2 ${newRule.triggerType === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                          onClick={() => setNewRule(prev => ({ ...prev, triggerType: 'manual' }))}>
                      <CardContent className="p-4 text-center">
                        <Play className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <h3 className="font-semibold">Manual</h3>
                        <p className="text-sm text-gray-600">Trigger manually</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {newRule.triggerType === 'time_based' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduleDate">Schedule Date</Label>
                      <Input
                        id="scheduleDate"
                        type="date"
                        value={newRule.scheduleDate}
                        onChange={(e) => setNewRule(prev => ({ ...prev, scheduleDate: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scheduleTime">Schedule Time</Label>
                      <Input
                        id="scheduleTime"
                        type="time"
                        value={newRule.scheduleTime}
                        onChange={(e) => setNewRule(prev => ({ ...prev, scheduleTime: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {newRule.triggerType === 'response_based' && (
                  <div className="space-y-2">
                    <Label htmlFor="followUpDelay">Follow-up Delay (hours)</Label>
                    <Input
                      id="followUpDelay"
                      type="number"
                      min="1"
                      max="168"
                      value={newRule.followUpDelay}
                      onChange={(e) => setNewRule(prev => ({ ...prev, followUpDelay: parseInt(e.target.value) }))}
                    />
                    <p className="text-sm text-gray-600">
                      How many hours to wait before sending follow-up if no response
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setShowCreateRule(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createAutomationRule}>
                    Create Rule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{automationRules.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {automationRules.filter(r => r.isActive).length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
                  <Play className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{automationRules.filter(r => r.isActive).length}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently running
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaigns.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Available for automation
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {automationRules.filter(r => r.triggerType === 'time_based' && r.isActive).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Time-based rules
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Automation Rules List */}
            <Card>
              <CardHeader>
                <CardTitle>Automation Rules</CardTitle>
                <p className="text-gray-600">Manage your campaign automation rules</p>
              </CardHeader>
              <CardContent>
                {automationRules.length === 0 ? (
                  <div className="text-center py-12">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No automation rules yet</h3>
                    <p className="text-gray-600 mb-6">
                      Create your first automation rule to streamline your campaign management.
                    </p>
                    <Button onClick={() => setShowCreateRule(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Create Your First Rule
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {automationRules.map((rule) => (
                      <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                              <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                                {rule.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant="outline">
                                {rule.triggerType.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            {rule.description && (
                              <p className="text-gray-600 mb-2">{rule.description}</p>
                            )}
                            
                            <div className="text-sm text-gray-500">
                              Campaign: {campaigns.find(c => c.id === rule.campaignId)?.name || 'Unknown'}
                              <span className="mx-2">•</span>
                              Created {new Date(rule.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRuleStatus(rule.id, rule.isActive)}
                            >
                              {rule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteRule(rule.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Automation Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Time-Based Rules</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Schedule campaigns during business hours</li>
                      <li>• Avoid weekends for B2B outreach</li>
                      <li>• Test different send times for optimal response</li>
                      <li>• Consider time zones of your target audience</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Response-Based Rules</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Wait 24-48 hours before follow-up</li>
                      <li>• Personalize follow-up messages</li>
                      <li>• Limit to 2-3 follow-ups maximum</li>
                      <li>• Track response patterns for optimization</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default CampaignAutomation