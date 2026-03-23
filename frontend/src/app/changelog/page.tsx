import Navbar from '@/components/home/Navbar';
import { Footer } from '@/components/home/CTASection';
import { Zap, Bug, Sparkles, ArrowUp } from 'lucide-react';

const releases = [
  {
    version: '1.3.0',
    date: 'March 2026',
    tag: 'feature',
    title: 'Business Plan & Full Customization',
    items: [
      { type: 'new', text: 'Business plan with full appearance customization (fonts, custom colors, avatar URL)' },
      { type: 'new', text: 'Database connection training source — connect PostgreSQL/MySQL directly' },
      { type: 'new', text: 'Admin contact queries inbox — manage all homepage form submissions' },
      { type: 'new', text: 'Plan expiry auto-downgrade — excess bots paused automatically on downgrade' },
      { type: 'improve', text: 'Admin email bypass — ADMIN_EMAILS get any plan instantly for free' },
      { type: 'fix', text: 'Markdown rendering in chatbot widget now correctly formats bold, lists, code blocks' },
    ],
  },
  {
    version: '1.2.0',
    date: 'February 2026',
    tag: 'feature',
    title: 'Messages Inbox & Analytics',
    items: [
      { type: 'new', text: 'Messages tab in dashboard — browse all conversations with full thread viewer' },
      { type: 'new', text: 'Filter conversations by date, email, bot, status, and message count' },
      { type: 'new', text: 'Mark conversations as resolved directly from inbox' },
      { type: 'new', text: 'Admin user queries panel — view all conversations platform-wide' },
      { type: 'improve', text: 'Analytics tab now shows daily conversation chart and rating stats' },
      { type: 'fix', text: 'Plan gates now use strict === true checks to prevent undefined bypass' },
    ],
  },
  {
    version: '1.1.0',
    date: 'January 2026',
    tag: 'feature',
    title: 'Plan Gating & Themes',
    items: [
      { type: 'new', text: '9 predefined colour themes (3 free, 6 Pro+)' },
      { type: 'new', text: '12 bot icon choices with plan-based access' },
      { type: 'new', text: 'UpgradeModal — inline plan comparison with Razorpay payment' },
      { type: 'new', text: 'WelcomeModal shown once per session for free-plan users' },
      { type: 'new', text: 'VerifyEmailModal — blocks bot creation until email is verified' },
      { type: 'new', text: 'Contact Us section on homepage with email confirmation' },
      { type: 'improve', text: 'Dashboard and admin panel UI fully redesigned' },
    ],
  },
  {
    version: '1.0.0',
    date: 'December 2025',
    tag: 'launch',
    title: 'Initial Launch',
    items: [
      { type: 'new', text: 'Create and deploy AI chatbots powered by Google Gemini 1.5 Flash' },
      { type: 'new', text: 'Train bots on PDF uploads, website URLs, and manual text' },
      { type: 'new', text: 'Full bot customization — colors, welcome message, system prompt' },
      { type: 'new', text: 'Script and iframe embed codes for any website' },
      { type: 'new', text: 'User dashboard with bot management and billing' },
      { type: 'new', text: 'Admin panel with user management, plan editor, and revenue charts' },
      { type: 'new', text: 'Email verification and password reset flows' },
      { type: 'new', text: 'Razorpay payment integration with monthly and yearly billing' },
    ],
  },
];

const tagStyles: Record<string, string> = {
  feature: 'bg-blue-100 text-blue-700',
  fix: 'bg-red-100 text-red-600',
  launch: 'bg-green-100 text-green-700',
};

const iconMap: Record<string, any> = {
  new: Sparkles,
  improve: ArrowUp,
  fix: Bug,
};
const iconColor: Record<string, string> = {
  new: 'text-blue-500',
  improve: 'text-purple-500',
  fix: 'text-red-400',
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Changelog</h1>
          <p className="text-gray-500 text-lg">Every update, fix, and new feature we ship.</p>
        </div>

        <div className="space-y-12">
          {releases.map((r) => (
            <div key={r.version} className="relative pl-8 border-l-2 border-gray-100">
              <div className="absolute -left-2.5 top-0 w-5 h-5 bg-primary-600 rounded-full border-4 border-white" />
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xl font-bold text-gray-900">v{r.version}</span>
                  <span className={`badge text-xs capitalize ${tagStyles[r.tag] || 'bg-gray-100 text-gray-600'}`}>{r.tag}</span>
                  <span className="text-sm text-gray-400">{r.date}</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-800">{r.title}</h2>
              </div>
              <ul className="space-y-2.5">
                {r.items.map((item, i) => {
                  const Icon = iconMap[item.type] || Sparkles;
                  return (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColor[item.type]}`} />
                      <span>{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
