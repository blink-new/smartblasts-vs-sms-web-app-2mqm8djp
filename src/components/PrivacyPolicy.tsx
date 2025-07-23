import React from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ArrowLeft } from 'lucide-react'

interface PrivacyPolicyProps {
  onBack: () => void
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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
              <span className="ml-3 text-gray-500">Privacy Policy</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Privacy Policy</CardTitle>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <div>
                    <h3 className="font-semibold">Personal Information:</h3>
                    <p>• Name, email address, phone number, and company information</p>
                    <p>• Account credentials and profile information</p>
                    <p>• Payment and billing information</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Usage Information:</h3>
                    <p>• Campaign data, contact lists, and message templates</p>
                    <p>• Analytics data and performance metrics</p>
                    <p>• Log data including IP addresses, browser type, and usage patterns</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p><strong>We use your information to:</strong></p>
                  <p>• Provide and maintain our service</p>
                  <p>• Process your transactions and manage your account</p>
                  <p>• Send you technical notices, updates, and support messages</p>
                  <p>• Analyze usage patterns to improve our service</p>
                  <p>• Detect, prevent, and address technical issues and security threats</p>
                  <p>• Comply with legal obligations</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Information Sharing and Disclosure</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p><strong>We do not sell, trade, or rent your personal information to third parties.</strong></p>
                  <div>
                    <h3 className="font-semibold">We may share information in the following circumstances:</h3>
                    <p>• With service providers who assist in operating our platform</p>
                    <p>• When required by law or to protect our rights</p>
                    <p>• In connection with a merger, acquisition, or sale of assets</p>
                    <p>• With your explicit consent</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>We implement appropriate security measures to protect your information:</p>
                  <p>• Encryption of data in transit and at rest</p>
                  <p>• Regular security assessments and updates</p>
                  <p>• Access controls and authentication measures</p>
                  <p>• Employee training on data protection practices</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your information for as long as your account is active or as needed to provide services. 
                  We may retain certain information for longer periods as required by law or for legitimate business purposes, 
                  such as fraud prevention and security.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Your Rights and Choices</h2>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p><strong>You have the right to:</strong></p>
                  <p>• Access and update your personal information</p>
                  <p>• Delete your account and associated data</p>
                  <p>• Export your data in a portable format</p>
                  <p>• Opt out of marketing communications</p>
                  <p>• Request correction of inaccurate information</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Cookies and Tracking Technologies</h2>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>We use cookies and similar technologies to:</p>
                  <p>• Remember your preferences and settings</p>
                  <p>• Analyze site traffic and usage patterns</p>
                  <p>• Provide personalized content and features</p>
                  <p>• Ensure security and prevent fraud</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Third-Party Services</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our service may contain links to third-party websites or integrate with third-party services. 
                  We are not responsible for the privacy practices of these third parties. We encourage you to 
                  review their privacy policies before providing any information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. International Data Transfers</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. 
                  We ensure appropriate safeguards are in place to protect your information in accordance with this privacy policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our service is not intended for children under 13 years of age. We do not knowingly collect 
                  personal information from children under 13. If we become aware that we have collected such information, 
                  we will take steps to delete it promptly.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Changes to This Privacy Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this privacy policy from time to time. We will notify you of any material changes 
                  by posting the new policy on this page and updating the "Last updated" date. We encourage you to 
                  review this policy periodically.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
                <div className="text-gray-700 leading-relaxed">
                  <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                  <p className="mt-2">
                    <strong>Email:</strong> privacy@smartblasts.com<br />
                    <strong>Address:</strong> SmartBlasts Inc., 123 Business Ave, Suite 100, City, State 12345<br />
                    <strong>Phone:</strong> (555) 123-4567
                  </p>
                </div>
              </section>

              <section className="bg-blue-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-3 text-blue-900">GDPR and CCPA Compliance</h2>
                <div className="text-blue-800 leading-relaxed space-y-2">
                  <p>We are committed to compliance with applicable data protection laws, including:</p>
                  <p>• <strong>GDPR:</strong> European users have additional rights under the General Data Protection Regulation</p>
                  <p>• <strong>CCPA:</strong> California residents have specific rights under the California Consumer Privacy Act</p>
                  <p>• <strong>Data Processing:</strong> We process personal data lawfully, fairly, and transparently</p>
                  <p>• <strong>Data Subject Rights:</strong> You can exercise your rights by contacting our privacy team</p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PrivacyPolicy