'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Trash2, Eye, Code2, BookOpen, Settings, BarChart3, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import UpgradeModal from '@/components/dashboard/UpgradeModal';
import KnowledgeTab from '@/components/dashboard/KnowledgeTab';
import {EmbedTab} from '@/components/dashboard/EmbedTab';
import AppearanceTab from '@/components/dashboard/AppearanceTab';
import {BotAnalyticsTab} from '@/components/dashboard/EmbedTab';

const TABS = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'appearance', label: 'Appearance', icon: Eye },
  { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
  { id: 'embed', label: 'Embed', icon: Code2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];


// Gated collect-email toggle
function CollectEmailToggle({ form, setForm }: { form: any; setForm: any }) {
  const { user } = useAuth();
  const [modal, setModal] = useState(false);
  const allowed = user?.allow_analytics === true; // reuse analytics flag (Pro+)

  return (
    <>
      {modal && <UpgradeModal open onClose={() => setModal(false)} feature="analytics" />}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
        <div>
          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
            Collect visitor email
            {!allowed && <span className="badge bg-primary-100 text-primary-700 text-xs">Pro</span>}
          </div>
          <div className="text-xs text-gray-500">Ask visitors for their email before chatting</div>
        </div>
        {allowed ? (
          <button onClick={() => setForm((p: any) => ({ ...p, collect_email: !p.collect_email }))}
            className={`relative w-10 h-5 rounded-full transition-colors ${form.collect_email ? 'bg-primary-600' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.collect_email ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        ) : (
          <button onClick={() => setModal(true)}
            className="flex items-center gap-1.5 text-xs text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 font-medium">
            🔒 Upgrade
          </button>
        )}
      </div>
    </>
  );
}

export default function BotDetailPage() {
  const { botId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [bot, setBot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('settings');
  const [form, setForm] = useState<any>({});
  const [overLimitModal, setOverLimitModal] = useState(false);

  useEffect(() => {
    api.get(`/bots/${botId}`).then(r => {
      setBot(r.data.bot);
      setForm(r.data.bot);
      if (r.data.bot.is_over_limit) setOverLimitModal(true);
    }).catch(() => router.push('/dashboard/bots'))
    .finally(() => setLoading(false));
  }, [botId]);

  const save = async () => {
    if (bot?.is_over_limit) { setOverLimitModal(true); return; }
    setSaving(true);
    try {
      const { data } = await api.put(`/bots/${botId}`, form);
      setBot(data.bot);
      setForm(data.bot);
      toast.success('Bot saved!');
    } catch (err) {
      const msg = getErrorMessage(err);
      if ((err as any)?.response?.data?.code === 'BOT_OVER_LIMIT') {
        setOverLimitModal(true);
      } else {
        toast.error(msg);
      }
    }
    finally { setSaving(false); }
  };

  const deleteBot = async () => {
    if (!confirm('Delete this bot permanently? All conversations will be lost.')) return;
    try {
      await api.delete(`/bots/${botId}`);
      toast.success('Bot deleted');
      router.push('/dashboard/bots');
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
    </div>
  );

  if (!bot) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Over-limit upgrade modal */}
      {overLimitModal && (
        <UpgradeModal open onClose={() => setOverLimitModal(false)} feature="bots" />
      )}

      {/* Over-limit banner */}
      {bot?.is_over_limit && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-red-800">⚠️ This bot is paused — over plan limit</p>
            <p className="text-xs text-red-600 mt-0.5">Upgrade your plan to edit and reactivate this bot. Your data is safe.</p>
          </div>
          <button onClick={() => setOverLimitModal(true)} className="btn-primary text-sm whitespace-nowrap bg-red-600 hover:bg-red-700 shadow-red-200">
            Upgrade now
          </button>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/bots" className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: form.primary_color || '#2563EB' }}>
              🤖
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{bot.name}</h1>
              <div className="flex items-center gap-2">
                <span className={`badge text-xs ${bot.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {bot.is_active ? 'Active' : 'Paused'}
                </span>
                <a href={`/chatbot/${botId}`} target="_blank" rel="noreferrer"
                  className="text-xs text-primary-600 hover:underline flex items-center gap-0.5">
                  Preview <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={deleteBot} className="btn-ghost text-red-500 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </button>
          {tab === 'settings' || tab === 'appearance' ? (
            <button onClick={save}   disabled={saving || bot?.is_over_limit}
 className={`btn-primary ${bot?.is_over_limit ? "opacity-50 cursor-not-allowed" : ""}`}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
            </button>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              tab === t.id ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'settings' && (
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Basic Info</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Bot Name</label>
                <input className="input" value={form.name || ''} onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Display Name</label>
                <input className="input" value={form.bot_name || ''} onChange={e => setForm((p: any) => ({ ...p, bot_name: e.target.value }))} />
              </div>
            </div>
            <div className="mt-4">
              <label className="label">Description</label>
              <input className="input" value={form.description || ''} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="mt-4">
              <label className="label">Welcome Message</label>
              <input className="input" value={form.welcome_message || ''} onChange={e => setForm((p: any) => ({ ...p, welcome_message: e.target.value }))} />
            </div>
            <div className="mt-4">
              <label className="label">Placeholder Text</label>
              <input className="input" value={form.placeholder_text || ''} onChange={e => setForm((p: any) => ({ ...p, placeholder_text: e.target.value }))} />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">AI Configuration</h3>
            <div>
              <label className="label">System Instructions</label>
              <textarea className="input resize-none" rows={5} value={form.system_prompt || ''}
                onChange={e => setForm((p: any) => ({ ...p, system_prompt: e.target.value }))} />
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="label">Temperature ({form.temperature || 0.7})</label>
                <input type="range" min="0" max="1" step="0.1" value={form.temperature || 0.7}
                  onChange={e => setForm((p: any) => ({ ...p, temperature: parseFloat(e.target.value) }))}
                  className="w-full accent-primary-600" />
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Precise</span><span>Creative</span></div>
              </div>
              <div>
                <label className="label">Response Length</label>
                <select className="input" value={form.response_length || 'medium'}
                  onChange={e => setForm((p: any) => ({ ...p, response_length: e.target.value }))}>
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
              <div>
                <label className="label">Language</label>
                <select className="input" value={form.language || 'en'}
                  onChange={e => setForm((p: any) => ({ ...p, language: e.target.value }))}>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>
            <div className="space-y-3">
              {/* Bot active — always available */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="text-sm font-medium text-gray-900">Bot is active</div>
                  <div className="text-xs text-gray-500">Allow users to chat with this bot</div>
                </div>
                <button onClick={() => setForm((p: any) => ({ ...p, is_active: !p.is_active }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.is_active ? 'bg-primary-600' : 'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Collect email — Pro+ only, gated */}
              <CollectEmailToggle form={form} setForm={setForm} />
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Branding settings are in the{' '}
              <button className="text-primary-600 underline" onClick={() => setTab('appearance')}>Appearance tab</button>.
            </p>
          </div>
        </div>
      )}

      {tab === 'appearance' && (
        bot?.is_over_limit
          ? <div className="card p-10 text-center text-gray-400 pointer-events-none opacity-40"><p>Upgrade to access Appearance settings</p></div>
          : <AppearanceTab form={form} setForm={setForm} />
      )}
      {tab === 'knowledge' && <KnowledgeTab botId={botId as string} />}
      {tab === 'embed' && <EmbedTab botId={botId as string} />}
      {tab === 'analytics' && <BotAnalyticsTab botId={botId as string} />}
    </div>
  );
}
