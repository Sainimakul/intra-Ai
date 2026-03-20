'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Check, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Free', price: { monthly: 0, yearly: 0 }, slug: 'free',
    desc: 'Perfect for trying out INTRA AI',
    features: ['1 Chatbot', '100 messages/month', 'Basic customization', 'INTRA AI branding', 'Community support'],
    cta: 'Get started free', highlight: false,
  },
  {
    name: 'Pro', price: { monthly: 999, yearly: 9990 }, slug: 'pro',
    desc: 'Best for small businesses & startups',
    features: ['5 Chatbots', '5,000 messages/month', 'URL scraping', 'PDF & file training', 'Remove branding', 'Analytics dashboard', 'Priority email support'],
    cta: 'Start Pro', highlight: true,
  },
  {
    name: 'Business', price: { monthly: 2999, yearly: 29990 }, slug: 'business',
    desc: 'For growing teams with advanced needs',
    features: ['20 Chatbots', '25,000 messages/month', 'Database connection', 'Custom domain', 'Advanced analytics', 'API access', 'Dedicated support'],
    cta: 'Start Business', highlight: false,
  },
];

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            💰 Simple pricing
          </div>
          <h2 className="section-title">Plans for every stage</h2>
          <p className="section-subtitle mx-auto">Start free, scale as you grow.</p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-sm font-medium ${!yearly ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
            <button onClick={() => setYearly(!yearly)}
              className={`relative w-12 h-6 rounded-full transition-colors ${yearly ? 'bg-primary-600' : 'bg-gray-200'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${yearly ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-medium ${yearly ? 'text-gray-900' : 'text-gray-400'}`}>
              Yearly <span className="badge bg-green-100 text-green-700 ml-1">Save 17%</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative rounded-2xl border p-7 flex flex-col ${plan.highlight
              ? 'bg-primary-600 border-primary-600 shadow-2xl shadow-primary-200 scale-105'
              : 'bg-white border-gray-100 shadow-sm'}`}>

              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                <p className={`text-sm ${plan.highlight ? 'text-primary-200' : 'text-gray-500'}`}>{plan.desc}</p>
              </div>

              <div className="mb-6">
                <div className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price[yearly ? 'yearly' : 'monthly'] === 0 ? 'Free' : `₹${plan.price[yearly ? 'yearly' : 'monthly'].toLocaleString()}`}
                </div>
                {plan.price.monthly > 0 && (
                  <div className={`text-sm mt-1 ${plan.highlight ? 'text-primary-200' : 'text-gray-400'}`}>
                    per {yearly ? 'year' : 'month'}
                  </div>
                )}
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? 'bg-primary-500' : 'bg-primary-100'}`}>
                      <Check className={`w-2.5 h-2.5 ${plan.highlight ? 'text-white' : 'text-primary-600'}`} />
                    </div>
                    <span className={`text-sm ${plan.highlight ? 'text-primary-100' : 'text-gray-600'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link href="/auth/register"
                className={`w-full text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all ${plan.highlight
                  ? 'bg-white text-primary-700 hover:bg-primary-50'
                  : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          All plans include 14-day free trial on paid features. No credit card required for Free plan.
        </p>
      </div>
    </section>
  );
}
