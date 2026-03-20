'use client';
import { useState, ReactNode } from 'react';
import { Lock, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UpgradeModal from './UpgradeModal';

interface Props {
  feature: 'url_scraping' | 'db_connect' | 'analytics' | 'branding' | 'api' | 'bots' | 'messages';
  children: ReactNode;
  // If true, renders children but with overlay. If false, replaces children entirely.
  overlay?: boolean;
  label?: string;
}

export default function PlanGate({ feature, children, overlay = false, label }: Props) {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const featureMap: Record<string, keyof typeof user> = {
    url_scraping: 'allow_url_scraping',
    db_connect: 'allow_db_connect',
    analytics: 'allow_analytics',
    branding: 'allow_branding_removal',
    api: 'allow_api_access',
  };

  const allowed = !featureMap[feature] || user?.[featureMap[feature] as keyof typeof user] === true;
  if (allowed) return <>{children}</>;

  const featureLabels: Record<string, string> = {
    url_scraping: 'URL Scraping',
    db_connect: 'Database Connection',
    analytics: 'Full Analytics',
    branding: 'Remove Branding',
    api: 'API Access',
    bots: 'More Bots',
    messages: 'More Messages',
  };

  if (overlay) {
    return (
      <>
        <div className="relative">
          <div className="opacity-30 pointer-events-none select-none">{children}</div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{label || featureLabels[feature]} — Paid Feature</h3>
              <p className="text-sm text-gray-500 mb-4">Upgrade your plan to unlock this feature.</p>
              <button onClick={() => setModalOpen(true)} className="btn-primary text-sm px-5 py-2">
                <Zap className="w-3.5 h-3.5" /> Upgrade Now
              </button>
            </div>
          </div>
        </div>
        <UpgradeModal open={modalOpen} onClose={() => setModalOpen(false)} feature={feature} />
      </>
    );
  }

  return (
    <>
      <div className="border-2 border-dashed border-primary-200 bg-primary-50/30 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6 text-primary-600" />
        </div>
        <h3 className="font-bold text-gray-900 mb-1">{label || featureLabels[feature]}</h3>
        <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">
          This feature is available on higher plans. Upgrade to unlock it.
        </p>
        <button onClick={() => setModalOpen(true)} className="btn-primary text-sm px-6 py-2.5">
          <Zap className="w-3.5 h-3.5" /> Upgrade to unlock
        </button>
      </div>
      <UpgradeModal open={modalOpen} onClose={() => setModalOpen(false)} feature={feature} />
    </>
  );
}
