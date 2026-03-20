'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Bot, Trash2, Edit2, Code, BarChart3, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import VerifyEmailModal from '@/components/dashboard/VerifyEmailModal';
import { formatDate, getErrorMessage } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function BotsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verifyModal, setVerifyModal] = useState(false);

  const handleNewBot = (e: React.MouseEvent) => {
    if (!user?.is_verified) {
      e.preventDefault();
      setVerifyModal(true);
      return;
    }
    router.push('/dashboard/bots/new');
  };
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () => api.get('/bots').then(r => {
    const allBots = r.data.bots || [];
    // Sort by created_at desc — same order backend uses for limit check
    const sorted = [...allBots].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setBots(sorted);
  }).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const toggle = async (bot: any) => {
    try {
      await api.put(`/bots/${bot.id}`, { is_active: !bot.is_active });
      setBots(prev => prev.map(b => b.id === bot.id ? { ...b, is_active: !b.is_active } : b));
      toast.success(`Bot ${!bot.is_active ? 'activated' : 'paused'}`);
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const deleteBot = async (id: string) => {
    if (!confirm('Delete this bot? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/bots/${id}`);
      setBots(prev => prev.filter(b => b.id !== id));
      toast.success('Bot deleted');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setDeleting(null); }
  };

  const filtered = bots.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <VerifyEmailModal open={verifyModal} onClose={() => setVerifyModal(false)} />
      <div className="max-w-5xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Chatbots</h1>
          <p className="text-gray-500 text-sm mt-1">{bots.length} bot{bots.length !== 1 ? 's' : ''} created</p>
        </div>
        <button onClick={handleNewBot} className="btn-primary">
          <Plus className="w-4 h-4" /> Create new bot
        </button>
      </div>

      {/* Search */}
      {bots.length > 0 && (
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Search bots..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card p-5 h-24 animate-pulse bg-gray-50" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Bot className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{search ? 'No bots found' : 'No bots yet'}</h3>
          <p className="text-gray-400 text-sm mb-6">
            {search ? 'Try a different search term.' : 'Create your first AI chatbot in minutes.'}
          </p>
          {!search && (
            <Link href="/dashboard/bots/new" className="btn-primary inline-flex">
              <Plus className="w-4 h-4" /> Create first bot
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(bot => (
            <div key={bot.id} className="card p-5 flex items-center gap-4 hover:border-primary-200 transition-colors">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: bot.primary_color || '#2563EB' }}>
                🤖
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{bot.name}</h3>
                  <span className={`badge text-xs ${
                    bot.is_active ? 'bg-green-100 text-green-700' :
                    bot.is_over_limit ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {bot.is_active ? 'Active' : bot.is_over_limit ? '⚠ Over limit' : 'Paused'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 truncate">{bot.description || 'No description'}</p>
                <div className="flex gap-4 text-xs text-gray-400 mt-1">
                  <span>{bot.total_messages || 0} messages</span>
                  <span>{bot.conversation_count || 0} conversations</span>
                  <span>Created {formatDate(bot.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggle(bot)} title={bot.is_active ? 'Pause' : 'Activate'}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                  {bot.is_active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <Link href={`/dashboard/bots/${bot.id}`} className="p-2 rounded-lg hover:bg-primary-50 text-gray-500 hover:text-primary-600 transition-colors" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button onClick={() => deleteBot(bot.id)} disabled={deleting === bot.id}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
