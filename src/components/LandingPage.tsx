import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { CheckCircle, XCircle, Menu, X, ArrowRight, BarChart3, Users, DollarSign, TrendingUp } from 'lucide-react'

interface LandingPageProps {
  user: any
  onLogin: () => void
  onGetStarted: () => void
}

const LandingPage: React.FC<LandingPageProps> = ({ user, onLogin, onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">SmartBlasts</h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#comparison" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Comparison
                </a>
                <a href="#metrics" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Metrics
                </a>
                <a href="#case-study" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Case Study
                </a>
                {user ? (
                  <Button onClick={onGetStarted} className="ml-4">
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button onClick={onLogin} className="ml-4">
                    Sign In
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600 p-2"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <a href="#comparison" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">
                Comparison
              </a>
              <a href="#metrics" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">
                Metrics
              </a>
              <a href="#case-study" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">
                Case Study
              </a>
              <div className="px-3 py-2">
                {user ? (
                  <Button onClick={onGetStarted} className="w-full">
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button onClick={onLogin} className="w-full">
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100">
              Proven Strategy
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Contact Form Outreach
              <span className="text-blue-600 block">Beats SMS Marketing</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover why smart B2B companies are switching from SMS to contact form outreach. 
              Get 3x higher response rates, 75% lower costs, and zero compliance headaches.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                {user ? 'Go to Dashboard' : 'Start Free Campaign'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-3 text-lg"
                onClick={() => document.getElementById('comparison')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See the Comparison
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Two Approaches to B2B Lead Generation
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Both SMS marketing and contact form outreach aim to generate leads, but one clearly outperforms the other.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">SMS Marketing</h3>
                <p className="text-gray-600 mb-4">
                  Sending promotional text messages directly to prospects' mobile phones. 
                  Requires phone numbers and compliance with TCPA regulations.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    High compliance risks
                  </li>
                  <li className="flex items-center text-gray-600">
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    Limited message length
                  </li>
                  <li className="flex items-center text-gray-600">
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    Expensive per message
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 border-green-200 bg-green-50">
              <CardContent className="p-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Form Outreach</h3>
                <p className="text-gray-600 mb-4">
                  Sending personalized messages through company contact forms on their websites. 
                  No phone numbers needed, fully compliant approach.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Zero compliance issues
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Unlimited message length
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Cost-effective scaling
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section id="comparison" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Head-to-Head Comparison
            </h2>
            <p className="text-lg text-gray-600">
              See why contact form outreach consistently outperforms SMS marketing
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-green-600">Contact Form Outreach</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-red-600">SMS Marketing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Response Rate</td>
                    <td className="px-6 py-4 text-center">
                      <Badge className="bg-green-100 text-green-800">23%</Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="secondary">8%</Badge>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Cost per Lead</td>
                    <td className="px-6 py-4 text-center">
                      <Badge className="bg-green-100 text-green-800">$3.20</Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="secondary">$12.80</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Compliance Risk</td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Message Length</td>
                    <td className="px-6 py-4 text-center">
                      <Badge className="bg-green-100 text-green-800">Unlimited</Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="secondary">160 chars</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Setup Complexity</td>
                    <td className="px-6 py-4 text-center">
                      <Badge className="bg-green-100 text-green-800">Simple</Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="secondary">Complex</Badge>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Personalization</td>
                    <td className="px-6 py-4 text-center">
                      <Badge className="bg-green-100 text-green-800">High</Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="secondary">Limited</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section id="metrics" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              The Numbers Don't Lie
            </h2>
            <p className="text-lg text-gray-600">
              Real performance data from 1,000+ campaigns
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">3x</div>
                <div className="text-sm text-gray-600">Higher Response Rate</div>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-center mb-4">
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">75%</div>
                <div className="text-sm text-gray-600">Lower Cost per Lead</div>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">4x</div>
                <div className="text-sm text-gray-600">More Qualified Leads</div>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-center mb-4">
                  <BarChart3 className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">0</div>
                <div className="text-sm text-gray-600">Compliance Issues</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits vs Challenges */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Contact Form Outreach Wins
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 border-green-200 bg-green-50">
              <CardContent className="p-0">
                <h3 className="text-xl font-semibold text-green-800 mb-4">Contact Form Benefits</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span className="text-gray-700">No TCPA compliance worries - completely legal</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span className="text-gray-700">Unlimited message length for detailed pitches</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span className="text-gray-700">Higher perceived legitimacy and professionalism</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span className="text-gray-700">Better targeting with company research</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span className="text-gray-700">Cost-effective scaling without per-message fees</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 border-red-200 bg-red-50">
              <CardContent className="p-0">
                <h3 className="text-xl font-semibold text-red-800 mb-4">SMS Challenges</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                    <span className="text-gray-700">TCPA violations can cost $500-$1,500 per text</span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                    <span className="text-gray-700">160 character limit restricts messaging</span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                    <span className="text-gray-700">Often perceived as spam or intrusive</span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                    <span className="text-gray-700">Requires phone number acquisition</span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                    <span className="text-gray-700">High per-message costs add up quickly</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section id="case-study" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Real Results: SaaS Company Case Study
            </h2>
            <p className="text-lg text-gray-600">
              How one B2B SaaS company switched strategies and tripled their lead generation
            </p>
          </div>

          <Card className="p-8 max-w-4xl mx-auto">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">The Challenge</h3>
                  <p className="text-gray-600 mb-4">
                    TechFlow Solutions was spending $15,000/month on SMS marketing campaigns 
                    targeting IT decision makers. Despite the high cost, they were only seeing 
                    an 8% response rate and facing compliance concerns.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">The Switch</h3>
                  <p className="text-gray-600">
                    They switched to contact form outreach, targeting the same audience through 
                    company websites with personalized, detailed messages about their IT solutions.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">The Results</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-700">Response Rate</span>
                      <span className="font-semibold text-green-600">8% → 23%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-700">Cost per Lead</span>
                      <span className="font-semibold text-green-600">$12.80 → $3.20</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-700">Qualified Leads/Month</span>
                      <span className="font-semibold text-green-600">39 → 147</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-700">Monthly Spend</span>
                      <span className="font-semibold text-green-600">$15,000 → $3,750</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">
                  "Switching to contact form outreach was the best decision we made. Not only did we 
                  triple our response rate, but we also eliminated compliance risks and reduced our 
                  lead generation costs by 75%." - Sarah Chen, Marketing Director
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Best Practices */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Best Practices for Contact Form Outreach
            </h2>
            <p className="text-lg text-gray-600">
              Maximize your results with these proven strategies
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Research First</h3>
                <p className="text-gray-600">
                  Spend time understanding the company's challenges, recent news, and specific 
                  pain points before crafting your message.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Personalize Everything</h3>
                <p className="text-gray-600">
                  Reference specific company details, recent achievements, or industry challenges 
                  to show you've done your homework.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Provide Value</h3>
                <p className="text-gray-600">
                  Lead with insights, free resources, or specific solutions rather than 
                  generic sales pitches.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Keep It Professional</h3>
                <p className="text-gray-600">
                  Use a professional tone, proper grammar, and clear structure to build 
                  credibility and trust.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Clear Call-to-Action</h3>
                <p className="text-gray-600">
                  End with a specific, low-commitment ask like a brief call or demo 
                  rather than pushing for an immediate sale.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Follow Up Strategically</h3>
                <p className="text-gray-600">
                  Plan a follow-up sequence with additional value and different angles 
                  to maximize response rates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Author Bio & CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Switch to Contact Form Outreach?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of B2B companies getting better results with contact form outreach. 
              Start your first campaign today and see the difference.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                {user ? 'Go to Dashboard' : 'Start Your First Campaign'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-3 text-lg"
              >
                Download Free Template
              </Button>
            </div>
          </div>

          <Card className="p-6 max-w-2xl mx-auto">
            <CardContent className="p-0">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">SB</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About SmartBlasts</h3>
              <p className="text-gray-600">
                SmartBlasts helps B2B companies generate more qualified leads through strategic 
                contact form outreach. Our platform automates the research, personalization, 
                and delivery process while maintaining the human touch that drives results.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">SmartBlasts</h3>
              <p className="text-gray-400">
                The smarter way to generate B2B leads through contact form outreach.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
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

export default LandingPage