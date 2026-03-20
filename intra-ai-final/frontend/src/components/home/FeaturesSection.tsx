import { Bot, Brain, FileText, Globe, Database, Palette, BarChart3, Code, Shield, Zap, MessageSquare, Settings } from 'lucide-react';

const features = [
  { icon: Brain, title: 'Gemini AI Powered', desc: 'Built on Google\'s latest Gemini AI for accurate, context-aware responses.', color: 'bg-blue-50 text-blue-600' },
  { icon: FileText, title: 'Train on PDFs & Docs', desc: 'Upload PDFs, Word docs, and text files to train your chatbot on your content.', color: 'bg-green-50 text-green-600' },
  { icon: Globe, title: 'Website URL Scraping', desc: 'Point to any URL and we\'ll extract and train your bot on that content automatically.', color: 'bg-purple-50 text-purple-600' },
  { icon: Database, title: 'Database Connection', desc: 'Connect your PostgreSQL or MySQL database to give your bot access to live data.', color: 'bg-orange-50 text-orange-600' },
  { icon: Palette, title: 'Full Customization', desc: 'Match your brand — customize colors, fonts, bot name, avatar, and chat bubble style.', color: 'bg-pink-50 text-pink-600' },
  { icon: Code, title: 'Easy Embed', desc: 'One line of code to embed your chatbot on any website or app.', color: 'bg-indigo-50 text-indigo-600' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track conversations, messages, and user engagement with detailed analytics.', color: 'bg-teal-50 text-teal-600' },
  { icon: MessageSquare, title: 'Conversation History', desc: 'Every conversation is stored and searchable in your dashboard.', color: 'bg-cyan-50 text-cyan-600' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your data is encrypted. We never share or use your data to train our models.', color: 'bg-red-50 text-red-600' },
  { icon: Zap, title: 'Instant Responses', desc: 'Responses in under a second. Optimized for speed and reliability.', color: 'bg-yellow-50 text-yellow-600' },
  { icon: Settings, title: 'Fine-tune Behavior', desc: 'Control tone, response length, temperature, and custom system instructions.', color: 'bg-slate-50 text-slate-600' },
  { icon: Bot, title: 'Multiple Bots', desc: 'Create different bots for support, sales, HR, and more — all in one place.', color: 'bg-violet-50 text-violet-600' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            ✨ Everything you need
          </div>
          <h2 className="section-title">Powerful features for every team</h2>
          <p className="section-subtitle mx-auto">
            From small startups to enterprises — INTRA AI has the tools to build the perfect chatbot for your use case.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className="card-hover p-5 group cursor-default">
              <div className={`w-10 h-10 ${f.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
