'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bot, Loader2, Sparkles, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import UpgradeModal from '@/components/dashboard/UpgradeModal';
import VerifyEmailModal from '@/components/dashboard/VerifyEmailModal';

const templates = [
  { name: 'Customer Support', bot_name: 'Support Agent', system_prompt: 'You are a helpful customer support agent. Be polite, empathetic, and try to resolve customer issues effectively.', primary_color: '#2563EB', description: 'Handle customer queries and support tickets 24/7' },
  { name: 'Sales Assistant', bot_name: 'Sales Bot', system_prompt: 'You are an enthusiastic sales assistant. Help visitors understand products, highlight benefits, and guide them towards making a purchase decision.', primary_color: '#16a34a', description: 'Convert visitors into customers with smart sales conversations' },
  { name: 'HR Helper', bot_name: 'HR Assistant', system_prompt: 'You are a professional HR assistant. Help employees with questions about policies, benefits, leave, and general HR matters.', primary_color: '#9333ea', description: 'Answer employee HR queries around the clock' },
  { name: 'FAQ Bot', bot_name: 'FAQ Assistant', system_prompt: 'You are a knowledgeable FAQ assistant. Answer questions clearly and accurately based on your training data.', primary_color: '#ea580c', description: 'Instantly answer frequently asked questions' },
  { name: 'Custom', bot_name: 'AI Assistant', system_prompt: 'You are a helpful AI assistant.', primary_color: '#2563EB', description: 'Build from scratch with full control' },
];

export default function NewBotPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<typeof templates[0] | null>(null);
  const [form, setForm] = useState({ name: '', description: '', bot_name: '', welcome_message: 'Hello! How can I help you today? 👋', system_prompt: '', primary_color: '#2563EB' });
  const [loading, setLoading] = useState(false);
  const [botCount, setBotCount] = useState(0);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [verifyModal, setVerifyModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api.get('/bots').then(r => setBotCount((r.data.bots || []).length));
    // Show verify modal immediately if not verified
    if (user && !user.is_verified) {
      setVerifyModal(true);
    }
  }, [user]);

  const atLimit = user?.max_bots !== undefined && botCount >= user.max_bots;

  const selectTemplate = (t: typeof templates[0]) => {
    if (atLimit) { setUpgradeModal(true); return; }
    setSelected(t);
    setForm(p => ({ ...p, bot_name: t.bot_name, system_prompt: t.system_prompt, primary_color: t.primary_color, description: t.description, name: t.name === 'Custom' ? '' : t.name }));
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Bot name is required');
    setLoading(true);
    try {
      const { data } = await api.post('/bots', form);
      toast.success('Bot created! Now train it with your content.');
      router.push(`/dashboard/bots/${data.bot.id}`);
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {upgradeModal && <UpgradeModal open onClose={() => setUpgradeModal(false)} feature="bots" />}
      <VerifyEmailModal open={verifyModal} onClose={() => setVerifyModal(false)} />

      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/bots" className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold text-gray-900">Create New Bot</h1><p className="text-gray-500 text-sm">Step {step} of 2</p></div>
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2].map(s => <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary-600' : 'bg-gray-200'}`} />)}
      </div>

      {/* Bot limit warning */}
      {atLimit && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <p className="text-sm text-amber-800">You've used all {user?.max_bots} bot slot{user?.max_bots !== 1 ? 's' : ''} on your {user?.plan_name} plan.</p>
          <button onClick={() => setUpgradeModal(true)} className="btn-primary text-sm whitespace-nowrap">
            <Zap className="w-3.5 h-3.5" /> Upgrade
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Choose a template</h2>
          <p className="text-gray-500 text-sm mb-6">Start with a template or build from scratch.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {templates.map(t => (
              <button key={t.name} onClick={() => selectTemplate(t)}
                className={`card-hover p-5 text-left group transition-all hover:border-primary-300 ${atLimit ? 'opacity-60 cursor-pointer' : ''}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3" style={{ backgroundColor: t.primary_color }}>
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-700">{t.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{t.description}</p>
                {t.name === 'Custom' && <span className="inline-flex items-center gap-1 mt-2 text-xs text-primary-600"><Sparkles className="w-3 h-3" /> Full control</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Bot Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Bot Name (internal) *</label>
                <input className="input" placeholder="e.g. Support Bot" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Display Name</label>
                <input className="input" placeholder="e.g. AI Assistant" value={form.bot_name} onChange={e => setForm(p => ({ ...p, bot_name: e.target.value }))} />
              </div>
            </div>
            <div className="mt-4">
              <label className="label">Description</label>
              <input className="input" placeholder="What does this bot do?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Appearance</h2>
            <div className="flex items-center gap-4">
              <div>
                <label className="label">Brand Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.primary_color} onChange={e => setForm(p => ({ ...p, primary_color: e.target.value }))} className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                  <input className="input w-32" value={form.primary_color} onChange={e => setForm(p => ({ ...p, primary_color: e.target.value }))} />
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: form.primary_color }}>
                <Bot className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">AI Behavior</h2>
            <div>
              <label className="label">Welcome Message</label>
              <input className="input" value={form.welcome_message} onChange={e => setForm(p => ({ ...p, welcome_message: e.target.value }))} />
            </div>
            <div className="mt-4">
              <label className="label">System Instructions</label>
              <textarea className="input min-h-24 resize-none" value={form.system_prompt} onChange={e => setForm(p => ({ ...p, system_prompt: e.target.value }))} rows={4} />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary px-6">Back</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create bot & continue →'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
