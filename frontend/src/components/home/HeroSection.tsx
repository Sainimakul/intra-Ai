'use client';
import Link from 'next/link';
import { ArrowRight, Sparkles, Star, Play } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-16">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-50 animate-pulse-slow" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-40 animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-30" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2563eb" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-700 rounded-full px-4 py-1.5 text-sm font-medium mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4" />
          Powered by Google Gemini AI
          <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">New</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6 animate-slide-up">
          Build AI Chatbots
          <br />
          <span className="gradient-text">In Minutes</span>
        </h1>

        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
          Create, train, and deploy intelligent AI chatbots for your business. Train on your PDFs, website, or database — no coding required.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in">
          <Link href="/auth/register" className="btn-primary text-base px-8 py-3.5 shadow-lg shadow-primary-200 hover:shadow-primary-300">
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#how-it-works" className="btn-secondary text-base px-8 py-3.5 group">
            <Play className="w-4 h-4 text-primary-600 group-hover:scale-110 transition-transform" />
            See how it works
          </a>
        </div>

        {/* Social proof */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-400 mb-16">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
            <span className="ml-1 text-gray-600 font-medium">4.9/5</span>
            <span className="text-gray-400">from 500+ users</span>
          </div>
          <span className="hidden sm:block text-gray-200">•</span>
          <span>No credit card required</span>
          <span className="hidden sm:block text-gray-200">•</span>
          <span>Free plan available</span>
        </div>

        {/* Hero Image/Demo mockup */}
        <div className="relative max-w-4xl mx-auto animate-float">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Browser bar */}
            <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-400 text-center mx-4">
                app.intra-ai.com/dashboard
              </div>
            </div>
            {/* Dashboard preview */}
            <div className="grid grid-cols-12 min-h-64 bg-gray-50">
              {/* Sidebar */}
              <div className="col-span-2 bg-white border-r border-gray-100 p-3 space-y-1">
                {['Dashboard','My Bots','Analytics','Settings'].map(item => (
                  <div key={item} className={`text-xs px-2 py-1.5 rounded-lg ${item === 'My Bots' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-400'}`}>
                    {item}
                  </div>
                ))}
              </div>
              {/* Main */}
              <div className="col-span-10 p-4">
                <div className="text-sm font-semibold text-gray-800 mb-3">My Chatbots</div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'Support Bot', color: 'bg-blue-500', msgs: '1.2K' },
                    { name: 'Sales Assistant', color: 'bg-green-500', msgs: '843' },
                    { name: 'HR Helper', color: 'bg-purple-500', msgs: '291' },
                  ].map(bot => (
                    <div key={bot.name} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                      <div className={`w-7 h-7 ${bot.color} rounded-lg mb-2 flex items-center justify-center`}>
                        <span className="text-white text-xs">🤖</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-800">{bot.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{bot.msgs} messages</div>
                      <div className="mt-2 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span className="text-xs text-green-600">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Floating chat bubble */}
          <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 max-w-48 text-left">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-primary-600 rounded-full flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-xs">🤖</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-800">Support Bot</div>
                <div className="text-xs text-gray-500 mt-0.5">Hi! How can I help you today? 👋</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
