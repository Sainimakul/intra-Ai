'use client';

function renderMarkdown(text: string): string {
  return text
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 rounded p-2 my-1 text-xs overflow-x-auto whitespace-pre-wrap"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-xs font-mono">$1</code>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<div class="font-bold text-sm mt-1">$1</div>')
    .replace(/^## (.+)$/gm, '<div class="font-bold mt-1">$1</div>')
    .replace(/^[\-\*] (.+)$/gm, '<div class="flex gap-1.5 my-0.5"><span class="mt-2 w-1 h-1 rounded-full bg-current flex-shrink-0"></span><span>$1</span></div>')
    .replace(/\n\n/g, '<div class="h-1.5"></div>')
    .replace(/\n/g, '<br/>');
}

import { useEffect, useState } from 'react';
import { Copy, Check, ExternalLink, MessageSquare, User, Clock, CheckCircle2, Circle, ChevronRight, ArrowLeft, Bot } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatDate, getErrorMessage } from '@/lib/utils';
import PlanGate from './PlanGate';

// ─── Embed Tab ────────────────────────────────────────────────────────────────
export function EmbedTab({ botId }: { botId: string }) {
  const [embed, setEmbed] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);
  useEffect(() => { api.get(`/bots/${botId}/embed`).then(r => setEmbed(r.data)); }, [botId]);
  const copy = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopied(key); toast.success('Copied!'); setTimeout(() => setCopied(null), 2000); };
  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-1">Script Embed (Recommended)</h3>
        <p className="text-sm text-gray-500 mb-4">Add before the closing <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> tag.</p>
        {embed ? (
          <div className="relative">
            <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-xl overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">{embed.embedCode}</pre>
            <button onClick={() => copy(embed.embedCode, 'script')} className="absolute top-3 right-3 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300">
              {copied === 'script' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        ) : <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />}
      </div>
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-1">iFrame Embed</h3>
        {embed ? (
          <div className="relative">
            <pre className="bg-gray-900 text-blue-300 text-xs p-4 rounded-xl overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">{embed.iframeCode}</pre>
            <button onClick={() => copy(embed.iframeCode, 'iframe')} className="absolute top-3 right-3 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300">
              {copied === 'iframe' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        ) : <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />}
      </div>
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Direct Link</h3>
        <a href={`/chatbot/${botId}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:underline text-sm">
          <ExternalLink className="w-4 h-4" />
          {typeof window !== 'undefined' ? `${window.location.origin}/chatbot/${botId}` : `/chatbot/${botId}`}
        </a>
      </div>
    </div>
  );
}

// ─── Bot Analytics Tab (full with conversations + message viewer) ─────────────
export function BotAnalyticsTab({ botId }: { botId: string }) {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [convTotal, setConvTotal] = useState(0);
  const [convPage, setConvPage] = useState(1);
  const [convLoading, setConvLoading] = useState(false);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { api.get(`/analytics/bot/${botId}`).then(r => setData(r.data)); }, [botId]);

  useEffect(() => {
    if (user?.allow_analytics !== true) return;
    setConvLoading(true);
    api.get(`/analytics/bot/${botId}/conversations?page=${convPage}&search=${search}`)
      .then(r => { setConversations(r.data.conversations || []); setConvTotal(r.data.total || 0); })
      .finally(() => setConvLoading(false));
  }, [botId, convPage, search, user]);

  const openConversation = async (conv: any) => {
    setSelectedConv(conv); setMsgLoading(true);
    try {
      const r = await api.get(`/analytics/conversation/${conv.id}/messages`);
      setMessages(r.data.messages || []);
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setMsgLoading(false); }
  };

  const toggleResolve = async (convId: string) => {
    await api.patch(`/analytics/conversation/${convId}/resolve`);
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, is_resolved: !c.is_resolved } : c));
    if (selectedConv?.id === convId) setSelectedConv((p: any) => ({ ...p, is_resolved: !p.is_resolved }));
  };

  const chartData = (data?.dailyConversations || []).map((d: any) => ({
    date: new Date(d.day).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    conversations: parseInt(d.conversations),
  }));

  const stats = data ? [
    { label: 'Conversations', value: data.totalConversations },
    { label: 'User Messages', value: data.totalMessages },
    { label: 'Avg Rating', value: data.avgRating ? data.avgRating.toFixed(1) + '/5' : 'N/A' },
    { label: 'Rated', value: data.ratedCount },
  ] : [];

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {!data ? [1,2,3,4].map(i => <div key={i} className="card p-5 h-24 animate-pulse bg-gray-50" />) :
          stats.map(s => (
            <div key={s.label} className="card p-5">
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
      </div>

      {/* Chart */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Daily Conversations (Last 30 days)</h3>
        {chartData.length === 0
          ? <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          : <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="conversations" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
        }
      </div>

      {/* Conversations list — Pro+ gated */}
      <PlanGate feature="analytics" label="Conversation History & Message Viewer">
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-gray-900">Conversations ({convTotal})</h3>
            <input className="input text-sm max-w-xs" placeholder="Search by email or name..."
              value={search} onChange={e => { setSearch(e.target.value); setConvPage(1); }} />
          </div>

          {selectedConv ? (
            /* ── Message thread view ── */
            <div className="flex flex-col h-[500px]">
              <div className="p-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
                <button onClick={() => setSelectedConv(null)} className="p-1.5 hover:bg-gray-200 rounded-lg">
                  <ArrowLeft className="w-4 h-4 text-gray-600" />
                </button>
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    {selectedConv.visitor_name || selectedConv.visitor_email || 'Anonymous visitor'}
                  </div>
                  <div className="text-xs text-gray-400">{formatDate(selectedConv.started_at)} · {selectedConv.message_count || 0} user messages</div>
                </div>
                <button onClick={() => toggleResolve(selectedConv.id)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${selectedConv.is_resolved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                  {selectedConv.is_resolved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                  {selectedConv.is_resolved ? 'Resolved' : 'Mark resolved'}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {msgLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-start gap-2'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 rounded-tl-sm shadow-sm'
                    }`}>
                      {msg.role === 'assistant'
                        ? <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                        : msg.content}
                      <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-primary-200' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                        {msg.tokens_used > 0 && msg.role === 'assistant' && ` · ${msg.tokens_used} tokens`}
                      </div>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-3 h-3 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── Conversations list ── */
            <div>
              {convLoading ? (
                <div className="p-4 space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}</div>
              ) : conversations.length === 0 ? (
                <div className="p-10 text-center text-gray-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No conversations yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {conversations.map(conv => (
                    <button key={conv.id} onClick={() => openConversation(conv)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900 truncate">
                            {conv.visitor_name || conv.visitor_email || 'Anonymous'}
                          </span>
                          {conv.is_resolved && <span className="badge bg-green-100 text-green-700 text-xs">Resolved</span>}
                          {conv.rating && <span className="text-xs text-yellow-600">{'⭐'.repeat(conv.rating)}</span>}
                        </div>
                        <div className="text-xs text-gray-400 truncate mt-0.5">
                          {conv.last_message || 'No messages'} · {conv.message_count || 0} msgs
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-xs text-gray-400">{formatDate(conv.last_message_at)}</div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 ml-auto mt-1" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {/* Pagination */}
              {convTotal > 20 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Page {convPage} · {convTotal} total</span>
                  <div className="flex gap-2">
                    <button onClick={() => setConvPage(p => Math.max(1, p - 1))} disabled={convPage === 1}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Prev</button>
                    <button onClick={() => setConvPage(p => p + 1)} disabled={convPage * 20 >= convTotal}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </PlanGate>
    </div>
  );
}

export default EmbedTab;
