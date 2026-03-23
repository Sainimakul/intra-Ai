import Navbar from '@/components/home/Navbar';
import { Footer } from '@/components/home/CTASection';
import { Shield, Download, Trash2, Eye, Edit, XCircle } from 'lucide-react';

const rights = [
  { icon: Eye,      title: 'Right to Access',      desc: 'You can request a complete copy of all data we hold about you, including account details, bot configurations, and conversation logs.' },
  { icon: Edit,     title: 'Right to Rectification',desc: 'If any data we hold about you is inaccurate or incomplete, you can request that we correct it.' },
  { icon: Trash2,   title: 'Right to Erasure',      desc: 'You can request deletion of your account and all associated data at any time. We will process this within 30 days.' },
  { icon: Download, title: 'Right to Portability',  desc: 'You can request your data in a structured, machine-readable format (JSON) to transfer to another service.' },
  { icon: XCircle,  title: 'Right to Object',       desc: 'You can object to the processing of your personal data. We will stop processing unless we have a compelling legitimate reason.' },
  { icon: Shield,   title: 'Right to Restrict',     desc: 'You can request that we restrict processing of your data while a complaint is being investigated.' },
];

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">GDPR Compliance</h1>
        <p className="text-gray-400 text-sm mb-5">Last updated: March 1, 2026</p>
        <p className="text-gray-600 leading-relaxed mb-12">
          INTRA AI is committed to protecting the privacy of all users and complying with the General Data Protection Regulation (GDPR) for users in the European Economic Area, and with India's Digital Personal Data Protection Act 2023 for Indian users.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your rights under GDPR</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {rights.map(r => (
            <div key={r.title} className="card p-5">
              <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center mb-3">
                <r.icon className="w-4 h-4 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm">{r.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-8 text-gray-600 leading-relaxed">
          {[
            { title: 'Lawful Basis for Processing', body: 'We process your personal data on the following lawful bases: Contract (processing necessary to provide the service you signed up for), Legitimate interests (security logs, fraud prevention, service improvement), and Consent (marketing emails, which you can withdraw at any time).' },
            { title: 'Data Controller', body: 'INTRA AI acts as the data controller for user account data. For conversation data collected by your chatbots on your website, you are the data controller and INTRA AI acts as a data processor on your behalf.' },
            { title: 'Data Transfers', body: 'Your data is stored on servers in India. If you are accessing from within the EEA, your data may be transferred to India. We ensure appropriate safeguards are in place for such transfers.' },
            { title: 'Data Retention', body: 'Account data is retained until you delete your account. Conversation data is retained for 12 months. Server logs are retained for 90 days. Payment records are retained for 7 years as required by Indian tax law.' },
            { title: 'Data Breaches', body: 'In the event of a data breach affecting your personal data, we will notify you by email within 72 hours of becoming aware of the breach, as required by GDPR Article 33.' },
            { title: 'How to Exercise Your Rights', body: 'Email your request to privacy@intra-ai.com with the subject line "GDPR Request". We will respond within 30 days. We may ask you to verify your identity before processing your request.' },
          ].map(s => (
            <div key={s.title}>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h2>
              <p>{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 card p-6 bg-primary-50 border-primary-200">
          <h3 className="font-bold text-gray-900 mb-2">Submit a GDPR request</h3>
          <p className="text-sm text-gray-600 mb-4">To access, correct, export, or delete your data, contact our privacy team.</p>
          <a href="mailto:privacy@intra-ai.com?subject=GDPR Request" className="btn-primary inline-flex text-sm px-5 py-2.5">
            Email privacy@intra-ai.com
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
