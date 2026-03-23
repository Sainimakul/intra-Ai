import Navbar from '@/components/home/Navbar';
import { Footer } from '@/components/home/CTASection';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: March 1, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
          {[
            {
              title: '1. Information We Collect',
              body: `When you create an account, we collect your name, email address, and password (stored as a bcrypt hash). When you use our chatbot builder, we store your bot configurations, training content (PDFs, URLs, database queries), and conversation logs. We also collect standard server logs (IP address, browser, timestamps) for security and debugging purposes.`
            },
            {
              title: '2. How We Use Your Information',
              body: `We use your information solely to operate and improve INTRA AI. This includes: providing the chatbot builder service, sending transactional emails (verification, password reset, billing), processing payments via Razorpay, and displaying analytics in your dashboard. We do not use your data to train AI models. We do not sell or rent your data to any third party.`
            },
            {
              title: '3. Data Storage and Security',
              body: `Your data is stored on servers located in India. We use industry-standard encryption (TLS in transit, bcrypt for passwords). Database credentials and API keys are stored as environment variables, never in source code. We perform regular security reviews and keep all dependencies updated.`
            },
            {
              title: '4. Conversation Data',
              body: `Conversations that visitors have with your chatbots are stored in our database and visible to you in your dashboard. This data is tied to your account and is never shared with other INTRA AI customers. Visitors are not required to create accounts and are identified only by session ID unless your bot is configured to collect email addresses.`
            },
            {
              title: '5. Third-Party Services',
              body: `We use the following third-party services: Google Gemini AI (for generating chatbot responses — only the message text is sent, not personal data), Razorpay (for payment processing — we never store card details), and Nodemailer via SMTP (for sending emails). Each of these services has their own privacy policy.`
            },
            {
              title: '6. Your Rights',
              body: `You have the right to access all data we hold about you, request correction of inaccurate data, request deletion of your account and all associated data, export your data in a machine-readable format, and withdraw consent at any time. To exercise any of these rights, email us at privacy@intra-ai.com.`
            },
            {
              title: '7. Data Retention',
              body: `We retain your account data for as long as your account is active. If you delete your account, we permanently delete all associated data within 30 days. Conversation logs are retained for 12 months by default unless you delete them earlier from your dashboard.`
            },
            {
              title: '8. Cookies',
              body: `We use a single authentication cookie (intra_token) to keep you logged in. We do not use advertising or tracking cookies. We do not use Google Analytics or any third-party analytics scripts on our platform.`
            },
            {
              title: '9. Changes to This Policy',
              body: `We may update this policy from time to time. We will notify you by email and update the "Last updated" date at the top of this page. Continued use of INTRA AI after changes constitutes acceptance of the updated policy.`
            },
            {
              title: '10. Contact',
              body: `For any privacy-related questions or requests, contact us at privacy@intra-ai.com. We respond to all requests within 72 hours.`
            },
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
