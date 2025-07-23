import React, { useState, useEffect } from 'react'
import { blink } from '../blink/client'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  ArrowRight, 
  CheckCircle, 
  MessageCircle, 
  Users, 
  TrendingUp,
  Mail,
  Phone,
  Target,
  BarChart3,
  Clock,
  Shield,
  Zap,
  Star,
  Quote,
  Play
} from 'lucide-react'

interface SmartBlastsWebsiteProps {
  user: any
  onLogin: () => void
  onSignup: () => void
  onGoToDashboard?: () => void
  onGoToTerms?: () => void
  onGoToPrivacy?: () => void
  onGoToAdmin?: () => void
}

const SmartBlastsWebsite: React.FC<SmartBlastsWebsiteProps> = ({ user, onLogin, onSignup, onGoToDashboard, onGoToTerms, onGoToPrivacy, onGoToAdmin }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    contactFormSuccess: 87,
    smsSuccess: 23,
    contactFormCost: 0.15,
    smsCost: 0.45,
    contactFormResponse: 12.3,
    smsResponse: 2.1
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">SmartBlasts</h1>
              <span className="ml-3 text-gray-500">vs SMS Marketing</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <a href="#comparison" className="text-gray-600 hover:text-blue-600">Comparison</a>
              <a href="#features" className="text-gray-600 hover:text-blue-600">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600">Pricing</a>
              {user ? (
                <Button variant="outline" onClick={onGoToDashboard}>Dashboard</Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={onLogin}>Sign In</Button>
                  <Button onClick={onSignup}>Start Free Trial</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Why Contact Form Outreach 
              <span className="text-blue-600"> Beats SMS Marketing</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover why smart B2B companies are switching from expensive SMS campaigns to 
              high-converting contact form outreach. Get 4x better results at half the cost.
            </p>
            <div className="flex justify-center space-x-4">
              {user ? (
                <Button size="lg" className="px-8 py-3" onClick={onGoToDashboard}>
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Go to Dashboard
                </Button>
              ) : (
                <Button size="lg" className="px-8 py-3" onClick={onSignup}>
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Start Free Trial
                </Button>
              )}
              <Button variant="outline" size="lg" className="px-8 py-3">
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.contactFormSuccess}%</div>
              <div className="text-gray-600">Contact Form Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500 mb-2">{stats.smsSuccess}%</div>
              <div className="text-gray-600">SMS Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">${stats.contactFormCost}</div>
              <div className="text-gray-600">Cost per Contact Form</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500 mb-2">${stats.smsCost}</div>
              <div className="text-gray-600">Cost per SMS</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Comparison Section */}
      <section id="comparison" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The Complete Comparison
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See why contact form outreach consistently outperforms SMS marketing 
              across every important metric that matters for B2B lead generation.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="costs">Costs</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="targeting">Targeting</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Contact Form Outreach */}
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-800">
                      <MessageCircle className="h-6 w-6 mr-2" />
                      Contact Form Outreach
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>87% delivery success rate</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>12.3% average response rate</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>$0.15 average cost per contact</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>No compliance restrictions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Professional business approach</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Detailed targeting options</span>
                    </div>
                  </CardContent>
                </Card>

                {/* SMS Marketing */}
                <Card className="border-2 border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-800">
                      <Phone className="h-6 w-6 mr-2" />
                      SMS Marketing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-5 w-5 rounded-full bg-red-500"></div>
                      <span>23% delivery success rate</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-5 w-5 rounded-full bg-red-500"></div>
                      <span>2.1% average response rate</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-5 w-5 rounded-full bg-red-500"></div>
                      <span>$0.45 average cost per SMS</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-5 w-5 rounded-full bg-red-500"></div>
                      <span>Heavy compliance restrictions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-5 w-5 rounded-full bg-red-500"></div>
                      <span>Often seen as spam/intrusive</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-5 w-5 rounded-full bg-red-500"></div>
                      <span>Limited targeting capabilities</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-8">
              <div className="grid md:grid-cols-3 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2 text-blue-600" />
                      Delivery Rates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Contact Forms</span>
                          <span className="text-sm text-green-600">87%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '87%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">SMS</span>
                          <span className="text-sm text-red-600">23%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{width: '23%'}}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      Response Rates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Contact Forms</span>
                          <span className="text-sm text-green-600">12.3%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '82%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">SMS</span>
                          <span className="text-sm text-red-600">2.1%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{width: '14%'}}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-600" />
                      Time to Response
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Contact Forms</span>
                          <span className="text-sm text-green-600">2.4 hours</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '75%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">SMS</span>
                          <span className="text-sm text-red-600">8.7 hours</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{width: '25%'}}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="costs" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Breakdown Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-semibold text-green-800">Contact Form Outreach</h4>
                        <div className="space-y-2 mt-2">
                          <div className="flex justify-between">
                            <span>Per contact cost</span>
                            <span className="font-semibold">$0.15</span>
                          </div>
                          <div className="flex justify-between">
                            <span>1000 contacts</span>
                            <span className="font-semibold">$150</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Expected responses (12.3%)</span>
                            <span className="font-semibold">123 responses</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span>Cost per response</span>
                            <span className="font-bold text-green-600">$1.22</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-l-4 border-red-500 pl-4">
                        <h4 className="font-semibold text-red-800">SMS Marketing</h4>
                        <div className="space-y-2 mt-2">
                          <div className="flex justify-between">
                            <span>Per SMS cost</span>
                            <span className="font-semibold">$0.45</span>
                          </div>
                          <div className="flex justify-between">
                            <span>1000 SMS messages</span>
                            <span className="font-semibold">$450</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Expected responses (2.1%)</span>
                            <span className="font-semibold">21 responses</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span>Cost per response</span>
                            <span className="font-bold text-red-600">$21.43</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>ROI Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-center p-6 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600 mb-2">17.5x</div>
                        <div className="text-sm text-green-800">Better ROI with Contact Forms</div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Why Contact Forms Win:</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            <li>• 3x lower cost per contact</li>
                            <li>• 5.8x higher response rate</li>
                            <li>• No carrier fees or restrictions</li>
                            <li>• Professional business approach</li>
                            <li>• Better lead quality</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-800">
                      <Shield className="h-5 w-5 mr-2" />
                      Contact Form Compliance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">No TCPA restrictions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">No carrier blocking</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">GDPR compliant by design</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">No opt-in requirements</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Professional business communication</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-800">
                      <Phone className="h-5 w-5 mr-2" />
                      SMS Compliance Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 rounded-full bg-red-500"></div>
                        <span className="text-sm">TCPA violations ($500-$1500 per text)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 rounded-full bg-red-500"></div>
                        <span className="text-sm">Carrier filtering and blocking</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 rounded-full bg-red-500"></div>
                        <span className="text-sm">Complex opt-in requirements</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 rounded-full bg-red-500"></div>
                        <span className="text-sm">Time restrictions (8am-9pm)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 rounded-full bg-red-500"></div>
                        <span className="text-sm">Seen as intrusive/spam</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="targeting" className="space-y-8">
              <div className="grid md:grid-cols-3 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Contact Form Targeting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Company size filtering</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Industry targeting</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Geographic targeting</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Technology stack filtering</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Revenue-based targeting</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">SMS Targeting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 rounded-full bg-red-500"></div>
                        <span className="text-sm">Phone number only</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 rounded-full bg-red-500"></div>
                        <span className="text-sm">Limited demographic data</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 rounded-full bg-red-500"></div>
                        <span className="text-sm">No business context</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 rounded-full bg-red-500"></div>
                        <span className="text-sm">Carrier restrictions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 rounded-full bg-red-500"></div>
                        <span className="text-sm">Opt-in requirements</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Targeting Advantage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">8x</div>
                      <div className="text-sm text-gray-600 mb-4">More targeting options</div>
                      <div className="space-y-2 text-sm">
                        <div>✓ Better lead quality</div>
                        <div>✓ Higher conversion rates</div>
                        <div>✓ Precise audience matching</div>
                        <div>✓ Business context available</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Real Results from Real Companies</h2>
            <p className="text-xl text-gray-600">See how businesses achieved better results by switching to contact form outreach</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <Quote className="h-8 w-8 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  "We switched from SMS to contact form outreach and saw our response rates jump from 1.8% to 14.2%. 
                  The cost savings alone paid for the switch in the first month."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">JS</span>
                  </div>
                  <div>
                    <div className="font-semibold">John Smith</div>
                    <div className="text-sm text-gray-500">CEO, TechStart Inc.</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <Quote className="h-8 w-8 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  "Contact form outreach gave us access to decision-makers we could never reach via SMS. 
                  Our lead quality improved dramatically, and we closed 3x more deals."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-semibold">MJ</span>
                  </div>
                  <div>
                    <div className="font-semibold">Maria Johnson</div>
                    <div className="text-sm text-gray-500">VP Sales, GrowthCorp</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <Quote className="h-8 w-8 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  "The compliance headaches with SMS were killing our campaigns. Contact forms eliminated 
                  all those issues while delivering better results. It's a no-brainer."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600 font-semibold">DL</span>
                  </div>
                  <div>
                    <div className="font-semibold">David Lee</div>
                    <div className="text-sm text-gray-500">CMO, ScaleUp Solutions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Switch to Contact Form Outreach?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of companies getting better results at lower costs with SmartBlasts
          </p>
          <div className="flex justify-center space-x-4">
            {user ? (
              <Button size="lg" variant="secondary" className="px-8 py-3" onClick={onGoToDashboard}>
                <Zap className="h-5 w-5 mr-2" />
                Go to Dashboard
              </Button>
            ) : (
              <Button size="lg" variant="secondary" className="px-8 py-3" onClick={onSignup}>
                <Zap className="h-5 w-5 mr-2" />
                Start Free Trial
              </Button>
            )}
            <Button size="lg" variant="outline" className="px-8 py-3 text-white border-white hover:bg-white hover:text-blue-600">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">SmartBlasts</h3>
              <p className="text-gray-400">
                The smarter way to reach B2B prospects with contact form outreach that actually works.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Case Studies</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><button onClick={onGoToPrivacy} className="hover:text-white text-left">Privacy Policy</button></li>
                <li><button onClick={onGoToTerms} className="hover:text-white text-left">Terms of Service</button></li>
                {onGoToAdmin && (
                  <li><button onClick={onGoToAdmin} className="hover:text-white text-left text-xs opacity-50">Admin</button></li>
                )}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SmartBlasts. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}



export default SmartBlastsWebsite