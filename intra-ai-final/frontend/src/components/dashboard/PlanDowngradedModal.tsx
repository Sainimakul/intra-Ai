'use client';
import { useState } from 'react';
import { X, AlertTriangle, Bot, Zap, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UpgradeModal from './UpgradeModal';

export default function PlanDowngradedModal() {
  const { wasDowngraded, clearDowngraded, user } = useAuth();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (!wasDowngraded) return null;

  if (upgradeOpen) {
    return <UpgradeModal open onClose={() => { setUpgradeOpen(false); clearDowngraded(); }} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up overflow-hidden">

        {/* Red top bar */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-5 text-white">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">Your plan has expired</h2>
          </div>
          <p className="text-red-100 text-sm">Your account has been moved back to the Free plan.</p>
        </div>

        <div className="p-6">
          {/* What happened */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5">
            <h3 className="font-semibold text-red-800 text-sm mb-2">What changed</h3>
            <ul className="space-y-1.5 text-sm text-red-700">
              <li className="flex items-center gap-2">
                <Bot className="w-3.5 h-3.5 flex-shrink-0" />
                Bots beyond your free limit have been <strong>paused</strong>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-3.5 h-3.5 flex-shrink-0" />
                Pro/Business features are now locked
              </li>
              <li className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />
                All your data is safe — nothing was deleted
              </li>
            </ul>
          </div>

          <p className="text-sm text-gray-500 mb-5">
            Upgrade to restore your bots and features instantly.
          </p>

          <button onClick={() => setUpgradeOpen(true)}
            className="btn-primary w-full py-3 text-base shadow-lg shadow-primary-100 mb-3">
            <Zap className="w-4 h-4" /> Upgrade now — restore everything
          </button>
          <button onClick={clearDowngraded}
            className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors">
            Continue on Free plan
          </button>
        </div>
      </div>
    </div>
  );
}
