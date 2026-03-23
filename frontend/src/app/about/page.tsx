import Navbar from '@/components/home/Navbar';
import { Footer } from '@/components/home/CTASection';
import { Bot, Zap, Shield, Heart } from 'lucide-react';
import Link from 'next/link';

const values = [
  { icon: Zap,    title: 'Move fast',      desc: 'We ship constantly. Every week brings new features, fixes, and improvements based on real user feedback.' },
  { icon: Shield, title: 'Privacy first',  desc: 'Your data belongs to you. We never sell it, never use it to train AI models, and store it securely.' },
  { icon: Heart,  title: 'Built for India',desc: 'INR pricing, Razorpay payments, Indian servers. We\'re built for Indian businesses from day one.' },
  { icon: Bot,    title: 'AI that works',  desc: 'No fluff. We build practical AI tools that solve real business problems and actually get used.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16 text-center">
        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
          We're building the easiest way<br />to deploy AI chatbots
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          INTRA AI started with one goal: make AI chatbot technology accessible to every business, regardless of technical skill or budget.
        </p>
      </div>

      {/* Story */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <div className="card p-8 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our story</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              We saw small businesses spending thousands on custom chatbot development, only to end up with brittle systems that couldn't be updated without a developer. At the same time, off-the-shelf solutions were either too expensive, too limited, or too complicated to set up.
            </p>
            <p>
              INTRA AI was built to fix that. We combined the power of Google Gemini AI with a no-code interface that lets anyone — a founder, a marketer, a support manager — build, train, and deploy a fully functional AI chatbot in minutes.
            </p>
            <p>
              We're a small, focused team based in India, building for Indian businesses first and the world second. Every pricing decision, every feature, every support interaction reflects that commitment.
            </p>
          </div>
        </div>

        {/* Values */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What we believe in</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {values.map(v => (
            <div key={v.title} className="card p-5">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-3">
                <v.icon className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{v.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Join thousands of businesses</h2>
          <p className="text-gray-500 mb-6">Start for free. No credit card required.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/auth/register" className="btn-primary px-8 py-3">Get started free</Link>
            <Link href="/#contact" className="btn-secondary px-8 py-3">Contact us</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
