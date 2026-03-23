import Navbar from '@/components/home/Navbar';
import { Footer } from '@/components/home/CTASection';
import { CheckCircle, Clock, Lightbulb } from 'lucide-react';

const roadmap = [
  {
    status: 'done',
    quarter: 'Q4 2025',
    items: [
      'Core chatbot builder with Gemini AI',
      'PDF, URL, and manual text training',
      'Embed codes (script + iframe)',
      'User dashboard and admin panel',
      'Razorpay payment integration',
    ],
  },
  {
    status: 'done',
    quarter: 'Q1 2026',
    items: [
      'Plan-gated features (Pro / Business)',
      'Messages inbox with conversation viewer',
      'Predefined themes and bot icons',
      'Database connection training source',
      'Auto plan expiry and bot pausing',
      'Contact queries admin inbox',
    ],
  },
  {
    status: 'in_progress',
    quarter: 'Q2 2026',
    items: [
      'Razorpay recurring subscriptions',
      'Webhook support for new conversations',
      'Bot API access (Business plan)',
      'Custom domain for bot pages',
      'WhatsApp channel integration',
    ],
  },
  {
    status: 'planned',
    quarter: 'Q3 2026',
    items: [
      'Multi-language auto-detection',
      'Voice input support in chatbot widget',
      'Team / multi-user accounts',
      'Zapier and Make.com integrations',
      'Advanced analytics with heatmaps',
    ],
  },
  {
    status: 'idea',
    quarter: 'Future',
    items: [
      'Mobile SDK (iOS + Android)',
      'Fine-tuned model training',
      'Live agent handoff',
      'A/B testing for bot responses',
      'SOC 2 compliance',
    ],
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  done:        { label: 'Shipped',     color: 'text-green-600',  bg: 'bg-green-50 border-green-200',  icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',    icon: Clock },
  planned:     { label: 'Planned',     color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200',icon: Clock },
  idea:        { label: 'Exploring',   color: 'text-gray-500',   bg: 'bg-gray-50 border-gray-200',    icon: Lightbulb },
};

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Product Roadmap</h1>
          <p className="text-gray-500 text-lg">Where we've been and where we're going.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {roadmap.map((phase) => {
            const cfg = statusConfig[phase.status];
            const Icon = cfg.icon;
            return (
              <div key={phase.quarter} className={`rounded-2xl border p-6 ${cfg.bg}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 text-lg">{phase.quarter}</h2>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold ${cfg.color}`}>
                    <Icon className="w-3.5 h-3.5" /> {cfg.label}
                  </span>
                </div>
                <ul className="space-y-2">
                  {phase.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${phase.status === 'done' ? 'bg-green-500' : phase.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-12 card p-6 text-center bg-primary-50 border-primary-200">
          <h3 className="font-bold text-gray-900 mb-2">Have a feature request?</h3>
          <p className="text-gray-500 text-sm mb-4">We'd love to hear from you. Your feedback shapes what we build next.</p>
          <a href="/contact" className="btn-primary inline-flex">Suggest a feature</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
