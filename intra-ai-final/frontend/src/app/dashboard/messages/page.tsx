'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  MessageSquare, Search, Filter, Bot, User, ChevronDown,
  CheckCircle2, Circle, X, Calendar, Hash, Mail, Loader2,
  RefreshCw, Lock, Zap, SlidersHorizontal
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatDate, getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';
import UpgradeModal from '@/components/dashboard/UpgradeModal';

// ─── Markdown renderer ────────────────────────────────────────────────────────
function renderMarkdown(text: string): string {
  return text
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 rounded p-2 my-1 text-xs overflow-x-auto whitespace-pre-wrap font-mono"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-xs font-mono">$1</code>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<div class="font-bold text-sm mt-1.5 mb-0.5">$1</div>')
    .replace(/^## (.+)$/gm, '<div class="font-bold mt-1.5 mb-0.5">$1</div>')
    .replace(/^# (.+)$/gm, '<div class="font-bold text-base mt-1.5 mb-0.5">$1</div>')
    .replace(/^[-*] (.+)$/gm, '<div class="flex gap-2 my-0.5"><span class="mt-2 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-60"></span><span>$1</span></div>')
    .replace(/^\d+\. (.+)$/gm, '<div class="flex gap-2 my-0.5"><span class="font-semibold flex-shrink-0 opacity-60">•</span><span>$1</span></div>')
    .replace(/\n\n/g, '<div class="h-2"></div>')
    .replace(/\n/g, '<br/>');
}

type Conversation = {
  id: string; session_id: string; visitor_name: string | null; visitor_email: string | null;
  visitor_ip: string | null; is_resolved: boolean; rating: number | null;
  started_at: string; last_message_at: string; bot_name: string; bot_color: string;
  bot_id: string; message_count: number; last_message: string | null;
};

type Message = { id: string; role: string; content: string; tokens_used: number; created_at: string };

const EMPTY_FILTERS = { search: '', botId: '', dateFrom: '', dateTo: '', resolved: '', minMessages: '', maxMessages: '', hasEmail: '' };

export default function MessagesPage() {
  const { user } = useAuth();
  const allowed = user?.allow_analytics === true;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [bots, setBots] = useState<any[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const LIMIT = 25;

  // Load bots for filter dropdown
  useEffect(() => {
    api.get('/bots').then(r => setBots(r.data.bots || []));
  }, []);

  const loadConversations = useCallback(async (p = 1, f = filters) => {
    if (!allowed) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT), ...f });
      // Remove empty params
      [...params.keys()].forEach(k => { if (!params.get(k)) params.delete(k); });
      const r = await api.get(`/analytics/conversations?${params}`);
      setConversations(r.data.conversations || []);
      setTotal(r.data.total || 0);
      setPage(p);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [allowed, filters]);

  useEffect(() => { loadConversations(1, filters); }, [allowed]);

  const openConversation = async (conv: Conversation) => {
    setSelected(conv);
    setMsgLoading(true);
    try {
      const r = await api.get(`/analytics/conversation/${conv.id}/messages`);
      setMessages(r.data.messages || []);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch { toast.error('Failed to load messages'); }
    finally { setMsgLoading(false); }
  };

  const toggleResolve = async (conv: Conversation) => {
    await api.patch(`/analytics/conversation/${conv.id}/resolve`);
    const updated = { ...conv, is_resolved: !conv.is_resolved };
    setConversations(prev => prev.map(c => c.id === conv.id ? updated : c));
    if (selected?.id === conv.id) setSelected(updated);
  };

  const applyFilters = () => { loadConversations(1, filters); setFiltersOpen(false); };
  const clearFilters = () => { setFilters(EMPTY_FILTERS); loadConversations(1, EMPTY_FILTERS); setFiltersOpen(false); };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // ── Not on paid plan ──────────────────────────────────────────────────────
  if (!allowed) {
    return (
      <>
        {upgradeModal && <UpgradeModal open onClose={() => setUpgradeModal(false)} feature="analytics" />}
        <div className="max-w-xl mx-auto mt-20 text-center px-4">
          <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Lock className="w-9 h-9 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages Inbox</h1>
          <p className="text-gray-500 mb-2">View every conversation your chatbots have, filter by date, email, bot, and message count — and read the full chat thread.</p>
          <p className="text-sm text-primary-600 font-medium mb-6">Available on Pro and Business plans</p>
          <button onClick={() => setUpgradeModal(true)} className="btn-primary px-8 py-3 text-base">
            <Zap className="w-4 h-4" /> Upgrade to unlock
          </button>

          {/* Blurred preview */}
          <div className="mt-10 relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Preview only</span>
            </div>
            <div className="p-4 space-y-3 select-none pointer-events-none opacity-40">
              {['Sarah Johnson · support@example.com', 'Anonymous · no email', 'Rahul Mehta · rahul@startup.io'].map((n, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-40 mb-1.5" />
                    <div className="h-2 bg-gray-100 rounded w-64" />
                  </div>
                  <div className="h-2 bg-gray-100 rounded w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Main layout: left list + right conversation ───────────────────────────
  return (
    <div className="flex h-[calc(100vh-56px)] -m-4 md:-m-6 overflow-hidden">

      {/* ── Left panel: conversation list ── */}
      <div className={`flex flex-col border-r border-gray-100 bg-white flex-shrink-0 transition-all ${selected ? 'hidden md:flex md:w-80 lg:w-96' : 'flex w-full md:w-80 lg:w-96'}`}>

        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Messages</h1>
              <p className="text-xs text-gray-400">{total} conversation{total !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => loadConversations(page, filters)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400" title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={() => setFiltersOpen(!filtersOpen)}
                className={`p-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors ${filtersOpen || activeFilterCount > 0 ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100 text-gray-500'}`}>
                <SlidersHorizontal className="w-4 h-4" />
                {activeFilterCount > 0 && <span className="w-4 h-4 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center font-bold">{activeFilterCount}</span>}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input className="input pl-9 text-sm py-2" placeholder="Search name, email, session..."
              value={filters.search}
              onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && applyFilters()} />
          </div>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 space-y-3 flex-shrink-0">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Bot</label>
                <select className="input text-xs py-1.5" value={filters.botId} onChange={e => setFilters(p => ({ ...p, botId: e.target.value }))}>
                  <option value="">All bots</option>
                  {bots.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                <select className="input text-xs py-1.5" value={filters.resolved} onChange={e => setFilters(p => ({ ...p, resolved: e.target.value }))}>
                  <option value="">All</option>
                  <option value="false">Open</option>
                  <option value="true">Resolved</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">From date</label>
                <input type="date" className="input text-xs py-1.5" value={filters.dateFrom} onChange={e => setFilters(p => ({ ...p, dateFrom: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">To date</label>
                <input type="date" className="input text-xs py-1.5" value={filters.dateTo} onChange={e => setFilters(p => ({ ...p, dateTo: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Min messages</label>
                <input type="number" min="1" className="input text-xs py-1.5" placeholder="e.g. 3" value={filters.minMessages} onChange={e => setFilters(p => ({ ...p, minMessages: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Has email</label>
                <select className="input text-xs py-1.5" value={filters.hasEmail} onChange={e => setFilters(p => ({ ...p, hasEmail: e.target.value }))}>
                  <option value="">Any</option>
                  <option value="true">Email only</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={applyFilters} className="btn-primary flex-1 text-xs py-2">Apply filters</button>
              <button onClick={clearFilters} className="btn-secondary text-xs py-2 px-3">Clear</button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-16 px-4">
              <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No conversations found</p>
              {activeFilterCount > 0 && <button onClick={clearFilters} className="mt-2 text-xs text-primary-600 hover:underline">Clear filters</button>}
            </div>
          ) : (
            conversations.map(conv => (
              <button key={conv.id} onClick={() => openConversation(conv)}
                className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors group ${selected?.id === conv.id ? 'bg-primary-50 border-l-2 border-l-primary-500' : ''}`}>
                <div className="flex items-start gap-3">
                  {/* Bot color dot + avatar */}
                  <div className="relative flex-shrink-0 mt-0.5">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
                      style={{ backgroundColor: conv.bot_color || '#2563EB' }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-gray-900 truncate">
                        {conv.visitor_name || conv.visitor_email || 'Anonymous'}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(conv.last_message_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: conv.bot_color || '#2563EB' }} />
                      <span className="text-xs text-gray-400 truncate">{conv.bot_name}</span>
                    </div>

                    <p className="text-xs text-gray-500 truncate leading-relaxed">
                      {conv.last_message || 'No messages yet'}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Hash className="w-3 h-3" />{conv.message_count}
                      </span>
                      {conv.visitor_email && (
                        <span className="text-xs text-gray-400 flex items-center gap-1 truncate max-w-24">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{conv.visitor_email}</span>
                        </span>
                      )}
                      {conv.is_resolved && (
                        <span className="badge bg-green-100 text-green-700 text-xs ml-auto">Resolved</span>
                      )}
                      {conv.rating && (
                        <span className="text-xs text-yellow-500 ml-auto">{'★'.repeat(conv.rating)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}

          {/* Pagination */}
          {total > LIMIT && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 sticky bottom-0 bg-white">
              <span className="text-xs text-gray-400">{((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total}</span>
              <div className="flex gap-1">
                <button onClick={() => loadConversations(page - 1, filters)} disabled={page === 1}
                  className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50">←</button>
                <button onClick={() => loadConversations(page + 1, filters)} disabled={page * LIMIT >= total}
                  className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50">→</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel: conversation thread ── */}
      {selected ? (
        <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
          {/* Thread header */}
          <div className="bg-white border-b border-gray-100 px-4 py-3 flex-shrink-0 flex items-center gap-3">
            {/* Back on mobile */}
            <button onClick={() => setSelected(null)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 flex-shrink-0">
              ← Back
            </button>

            {/* Visitor avatar */}
            <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm">
                {selected.visitor_name || selected.visitor_email || 'Anonymous visitor'}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selected.bot_color || '#2563EB' }} />
                  {selected.bot_name}
                </span>
                {selected.visitor_email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{selected.visitor_email}</span>}
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(selected.started_at)}</span>
                <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{selected.message_count} messages</span>
                {selected.visitor_ip && <span className="hidden lg:flex items-center gap-1 text-gray-300">IP: {selected.visitor_ip}</span>}
              </div>
            </div>

            {/* Resolve button */}
            <button onClick={() => toggleResolve(selected)}
              className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-colors ${
                selected.is_resolved
                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}>
              {selected.is_resolved
                ? <><CheckCircle2 className="w-3.5 h-3.5" /> Resolved</>
                : <><Circle className="w-3.5 h-3.5" /> Mark resolved</>}
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
            {msgLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No messages in this conversation</div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-start gap-2.5'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-white"
                      style={{ backgroundColor: selected.bot_color || '#2563EB' }}>
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-sm'
                      : 'bg-white text-gray-800 shadow-sm rounded-tl-sm'
                  }`}>
                    {msg.role === 'assistant'
                      ? <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                      : msg.content}
                    <div className={`text-xs mt-1.5 flex items-center gap-2 ${msg.role === 'user' ? 'text-primary-200 justify-end' : 'text-gray-400'}`}>
                      <span>{new Date(msg.created_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.tokens_used > 0 && msg.role === 'assistant' && <span>{msg.tokens_used} tokens</span>}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      ) : (
        /* Empty state when nothing selected — desktop only */
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <MessageSquare className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-400">Select a conversation to read</p>
            <p className="text-xs text-gray-300 mt-1">Click any message on the left</p>
          </div>
        </div>
      )}
    </div>
  );
}
