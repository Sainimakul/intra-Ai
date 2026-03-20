'use client';
import { useState } from 'react';
import { X, Zap, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UpgradeModal from './UpgradeModal';

interface Props {
  open: boolean;
  onClose: () => void;
}

const freeFeatures = ['1 chatbot', '100 messages/month', 'PDF upload', 'Basic customization'];
const proFeatures = ['5 chatbots', '5,000 messages/month', 'URL scraping', 'Remove branding', 'Analytics & message inbox', 'Priority support'];

export default function WelcomeModal({ open, onClose }: Props) {
  const { user } = useAuth();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (!open) return null;

  const handleUpgrade = () => {
    setUpgradeOpen(true);
  };

  const handleUpgradeClose = () => {
    setUpgradeOpen(false);
    onClose();
  };

  if (upgradeOpen) {
    return <UpgradeModal open onClose={handleUpgradeClose} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up overflow-hidden">

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 z-10">
          <X className="w-4 h-4" />
        </button>

        {/* Top gradient header */}
        <div className="bg-gradient-to-br from-primary-600 to-blue-500 px-7 py-8 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-semibold text-primary-100">Welcome to INTRA AI</span>
          </div>
          <h2 className="text-2xl font-extrabold mb-1">
            Hey {user?.name?.split(' ')[0]}, you're on the <span className="text-yellow-300">Free plan</span>
          </h2>
          <p className="text-primary-200 text-sm">
            You can start building right away — or unlock the full power with Pro.
          </p>
        </div>

        {/* Plan comparison */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Free */}
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="text-sm font-bold text-gray-700 mb-3">Free (current)</div>
              <ul className="space-y-2">
                {freeFeatures.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="border-2 border-primary-400 rounded-xl p-4 bg-primary-50/40 relative">
              <div className="absolute -top-2.5 left-3">
                <span className="bg-primary-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" /> Recommended
                </span>
              </div>
              <div className="text-sm font-bold text-primary-700 mb-3 mt-1">Pro</div>
              <ul className="space-y-2">
                {proFeatures.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTAs */}
          <button onClick={handleUpgrade}
            className="btn-primary w-full py-3 text-base mb-3 shadow-lg shadow-primary-100">
            <Zap className="w-4 h-4" /> Upgrade to Pro — ₹999/month
          </button>
          <button onClick={onClose}
            className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 flex items-center justify-center gap-1 transition-colors group">
            Continue with Free plan
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
