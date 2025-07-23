import React from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ArrowLeft } from 'lucide-react'

interface TermsOfServiceProps {
  onBack: () => void
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-blue-600">SmartBlasts</h1>
              <span className="ml-3 text-gray-500">Terms of Service</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Terms of Service</CardTitle>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing and using SmartBlasts ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
                <p className="text-gray-700 leading-relaxed">
                  SmartBlasts is a contact form outreach platform that enables users to create and manage email campaigns, 
                  manage contacts, and track campaign performance. The service includes features such as drip campaigns, 
                  template management, analytics, and automation tools.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>• You are responsible for maintaining the confidentiality of your account credentials</p>
                  <p>• You are responsible for all activities that occur under your account</p>
                  <p>• You must provide accurate and complete information when creating your account</p>
                  <p>• You must notify us immediately of any unauthorized use of your account</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Acceptable Use Policy</h2>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p><strong>You agree NOT to use the service to:</strong></p>
                  <p>• Send spam, unsolicited, or bulk email messages</p>
                  <p>• Violate any applicable laws or regulations</p>
                  <p>• Infringe on intellectual property rights</p>
                  <p>• Transmit malicious code or harmful content</p>
                  <p>• Harass, abuse, or harm other users</p>
                  <p>• Attempt to gain unauthorized access to our systems</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Subscription Plans and Billing</h2>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>• Free plan includes 25 messages per month</p>
                  <p>• Paid plans are billed monthly or annually in advance</p>
                  <p>• All fees are non-refundable unless required by law</p>
                  <p>• We reserve the right to change pricing with 30 days notice</p>
                  <p>• Accounts may be suspended for non-payment</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Data and Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, 
                  to understand our practices regarding the collection, use, and disclosure of your personal information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Intellectual Property</h2>
                <p className="text-gray-700 leading-relaxed">
                  The Service and its original content, features, and functionality are and will remain the exclusive property of 
                  SmartBlasts and its licensors. The Service is protected by copyright, trademark, and other laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>• You may terminate your account at any time</p>
                  <p>• We may terminate or suspend your account for violations of these terms</p>
                  <p>• Upon termination, your right to use the Service will cease immediately</p>
                  <p>• We may retain certain information as required by law or for legitimate business purposes</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Disclaimers and Limitation of Liability</h2>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>• The Service is provided "as is" without warranties of any kind</p>
                  <p>• We do not guarantee uninterrupted or error-free service</p>
                  <p>• Our liability is limited to the amount you paid for the Service in the past 12 months</p>
                  <p>• We are not liable for indirect, incidental, or consequential damages</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of significant changes via email 
                  or through the Service. Continued use of the Service after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Contact Information</h2>
                <div className="text-gray-700 leading-relaxed">
                  <p>If you have any questions about these Terms of Service, please contact us at:</p>
                  <p className="mt-2">
                    <strong>Email:</strong> support@smartblasts.com<br />
                    <strong>Address:</strong> SmartBlasts Inc., 123 Business Ave, Suite 100, City, State 12345
                  </p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TermsOfService