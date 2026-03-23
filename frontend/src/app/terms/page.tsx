import Navbar from '@/components/home/Navbar';
import { Footer } from '@/components/home/CTASection';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: March 1, 2026</p>
        <div className="space-y-8 text-gray-600 leading-relaxed">
          {[
            { title: '1. Acceptance of Terms', body: 'By creating an account or using INTRA AI, you agree to these Terms of Service. If you do not agree, do not use the service. These terms apply to all users including free and paid plan subscribers.' },
            { title: '2. Description of Service', body: 'INTRA AI is a SaaS platform that allows users to build, train, and deploy AI-powered chatbots using Google Gemini AI. Features vary by plan as described on the pricing page.' },
            { title: '3. Account Responsibilities', body: 'You are responsible for maintaining the security of your account credentials. You must be at least 18 years old to create an account. You may not share your account or use it for multiple businesses without purchasing separate accounts.' },
            { title: '4. Acceptable Use', body: 'You may not use INTRA AI to: send spam or unsolicited messages, collect personal data without consent, impersonate other individuals or organisations, violate any applicable law, or deploy chatbots that provide dangerous medical, legal, or financial advice. We reserve the right to suspend accounts that violate these rules.' },
            { title: '5. Intellectual Property', body: 'INTRA AI and its software, design, and branding are owned by us. Your bot configurations, training data, and conversation history belong to you. By uploading content to train your bots, you grant us a limited licence to process that content to provide the service.' },
            { title: '6. Payment and Billing', body: 'Paid plans are billed monthly or annually via Razorpay. Payments are non-refundable except as required by applicable law. If you downgrade or cancel, your plan remains active until the end of the billing period. We reserve the right to change pricing with 30 days notice.' },
            { title: '7. Plan Limits and Enforcement', body: 'Each plan has defined limits on bots, messages, and features. Exceeding your plan limits will result in service restrictions. If your subscription expires, your account is downgraded to the Free plan and bots exceeding the Free limit are paused (not deleted).' },
            { title: '8. Service Availability', body: 'We aim for 99.5% uptime but do not guarantee uninterrupted service. Scheduled maintenance will be communicated in advance where possible. We are not liable for damages resulting from service outages.' },
            { title: '9. Limitation of Liability', body: 'INTRA AI is provided "as is". We are not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability in any month shall not exceed the amount you paid us in that month.' },
            { title: '10. Termination', body: 'You may cancel your account at any time from your dashboard settings. We may terminate accounts for violations of these terms with or without notice. Upon termination, your data will be deleted within 30 days.' },
            { title: '11. Governing Law', body: 'These terms are governed by the laws of India. Any disputes shall be resolved in the courts of India.' },
            { title: '12. Contact', body: 'For any questions about these terms, email us at legal@intra-ai.com.' },
          ].map(s => (
            <div key={s.title}>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h2>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
