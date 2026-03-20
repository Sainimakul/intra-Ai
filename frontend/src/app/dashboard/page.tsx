'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bot, MessageSquare, TrendingUp, Plus, ArrowRight, Zap } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import WelcomeModal from '@/components/dashboard/WelcomeModal';
import VerifyEmailModal from '@/components/dashboard/VerifyEmailModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [welcomeModal, setWelcomeModal] = useState(false);
  const [verifyModal, setVerifyModal] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    try {
      api.get('/bots').then(r => setBots(r.data.bots || [])).finally(() => setLoading(false));
    } catch (err) { console.log(err); }
  }, []);

  // Show welcome/upgrade modal once per session for free-plan users
  useEffect(() => {
    if (!user || shownRef.current) return;
    shownRef.current = true;

    const sessionKey = `intra_welcomed_${user.id}`;
    const alreadyShown = sessionStorage.getItem(sessionKey);
    if (!alreadyShown && (user.plan_slug === 'free' || !user.plan_slug)) {
      sessionStorage.setItem(sessionKey, '1');
      // Small delay so dashboard renders first
      setTimeout(() => setWelcomeModal(true), 800);
    }
  }, [user]);

  const handleNewBot = (e: React.MouseEvent) => {
    if (!user?.is_verified) {
      e.preventDefault();
      setVerifyModal(true);
      return;
    }
    router.push('/dashboard/bots/new');
  };

  const totalMessages = bots.reduce((s, b) => s + (b.total_messages || 0), 0);
  const totalConvs = bots.reduce((s, b) => s + (parseInt(b.conversation_count) || 0), 0);

  const stats = [
    { label: 'Total Bots', value: bots.length, icon: Bot, color: 'bg-blue-50 text-blue-600', max: user?.max_bots },
    { label: 'Total Messages', value: totalMessages.toLocaleString(), icon: MessageSquare, color: 'bg-green-50 text-green-600' },
    { label: 'Conversations', value: totalConvs.toLocaleString(), icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
    { label: 'Messages Used', value: `${user?.messages_used_this_month || 0}/${user?.max_messages_per_month || 100}`, icon: Zap, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <>
      <WelcomeModal open={welcomeModal} onClose={() => setWelcomeModal(false)} />
      <VerifyEmailModal open={verifyModal} onClose={() => setVerifyModal(false)} />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">Here's what's happening with your chatbots today.</p>
          </div>
          <button onClick={handleNewBot} className="btn-primary">
            <Plus className="w-4 h-4" /> New Bot
          </button>
        </div>

        {/* Email verify banner */}
        {!user?.is_verified && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Please verify your email address to start creating bots.
            </p>
            <button onClick={() => setVerifyModal(true)} className="text-sm font-semibold text-yellow-700 hover:underline whitespace-nowrap">
              Resend email →
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="card p-5 group hover:shadow-md transition-all">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-extrabold text-gray-900 tabular-nums">{loading ? <span className="inline-block w-12 h-6 bg-gray-100 animate-pulse rounded" /> : s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              {s.max && (
                <div className="mt-2">
                  <div className="w-full h-1 bg-gray-100 rounded-full">
                    <div className="h-1 bg-primary-400 rounded-full transition-all" style={{ width: `${Math.min(100, (bots.length / s.max) * 100)}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{bots.length} of {s.max} used</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bots grid */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Chatbots</h2>
          <Link href="/dashboard/bots" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="card p-5 h-40 animate-pulse bg-gray-50" />)}
          </div>
        ) : bots.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create your first chatbot</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Train an AI chatbot on your content and embed it on your website in minutes.
            </p>
            <button onClick={handleNewBot} className="btn-primary inline-flex">
              <Plus className="w-4 h-4" /> Create bot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bots.slice(0, 6).map(bot => (
              <Link key={bot.id} href={`/dashboard/bots/${bot.id}`}
                className="card-hover p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: bot.primary_color || '#2563EB' }}>
                    {bot.bot_name?.[0] || '🤖'}
                  </div>
                  <span className={`badge ${bot.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {bot.is_active ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{bot.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{bot.description || 'No description'}</p>
                </div>
                <div className="flex gap-4 text-xs text-gray-500 pt-1 border-t border-gray-50">
                  <span>{bot.total_messages || 0} messages</span>
                  <span>{bot.conversation_count || 0} conversations</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
