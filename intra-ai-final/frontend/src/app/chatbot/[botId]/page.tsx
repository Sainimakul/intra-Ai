'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Send, Loader2, Bot, X, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { generateSessionId } from '@/lib/utils';

type Message = { role: 'user' | 'assistant'; content: string; ts: Date };


// Simple markdown → HTML renderer (no external dependency needed)
function renderMarkdown(text: string): string {
  return text
    // Code blocks first (before other rules consume backticks)
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 text-green-300 rounded-lg p-3 my-2 text-xs overflow-x-auto whitespace-pre-wrap"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-black/10 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Headers
    .replace(/^### (.+)$/gm, '<div class="font-bold text-sm mt-2 mb-1">$1</div>')
    .replace(/^## (.+)$/gm, '<div class="font-bold text-base mt-2 mb-1">$1</div>')
    .replace(/^# (.+)$/gm, '<div class="font-bold text-lg mt-2 mb-1">$1</div>')
    // Unordered lists
    .replace(/^[\-\*] (.+)$/gm, '<div class="flex gap-2 my-0.5"><span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0"></span><span>$1</span></div>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<div class="flex gap-2 my-0.5 ml-1"><span class="font-semibold flex-shrink-0">•</span><span>$1</span></div>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="border-current opacity-20 my-2" />')
    // Line breaks — double newline = paragraph gap
    .replace(/\n\n/g, '<div class="h-2"></div>')
    .replace(/\n/g, '<br/>');
}

export default function ChatbotPage() {
  const { botId } = useParams();
  const [bot, setBot] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [botLoading, setBotLoading] = useState(true);
  const [sessionId] = useState(() => generateSessionId());
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get(`/bots/public/${botId}`)
      .then(r => {
        const b = r.data.bot;
        setBot(b);
        if (!b.collect_email) setEmailSubmitted(true);
        setMessages([{ role: 'assistant', content: b.welcome_message || 'Hello! How can I help you today?', ts: new Date() }]);
        // Load history
        return api.get(`/chat/history/${sessionId}/${botId}`);
      })
      .then(r => {
        if (r?.data?.messages?.length > 0) {
          setMessages(r.data.messages.map((m: any) => ({ role: m.role, content: m.content, ts: new Date(m.created_at) })));
        }
      })
      .catch(() => {})
      .finally(() => setBotLoading(false));
  }, [botId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg, ts: new Date() }]);
    setLoading(true);
    try {
      const { data } = await api.post('/chat/message', {
        botId, message: msg, sessionId,
        visitorEmail: emailSubmitted ? email : undefined,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.message, ts: new Date() }]);
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || 'Something went wrong. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${errMsg}`, ts: new Date() }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const reset = () => {
    setMessages([{ role: 'assistant', content: bot?.welcome_message || 'Hello! How can I help you today?', ts: new Date() }]);
  };

  if (botLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading chatbot...</p>
      </div>
    </div>
  );

  if (!bot) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Bot className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Bot not found</h2>
        <p className="text-gray-400 text-sm mt-1">This chatbot doesn't exist or has been disabled.</p>
      </div>
    </div>
  );

  const primary = bot.primary_color || '#2563EB';
  const secondary = bot.secondary_color || '#DBEAFE';
  const textColor = bot.text_color || '#1F2937';
  const borderRadius = bot.bubble_style === 'square' ? '8px' : bot.bubble_style === 'pill' ? '999px' : '18px';
  const font = bot.font_family || 'Inter';

  return (
    <div className="flex flex-col h-screen bg-gray-50" style={{ fontFamily: font }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 text-white shadow-sm flex-shrink-0"
        style={{ backgroundColor: primary }}>
        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">
          {bot.avatar_url
            ? <img src={bot.avatar_url} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
            : '🤖'}
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-sm">{bot.bot_name || 'AI Assistant'}</h1>
          <div className="flex items-center gap-1.5 text-xs opacity-80">
            <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
            Online
          </div>
        </div>
        <button onClick={reset} title="New conversation" className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Email gate */}
      {bot.collect_email && !emailSubmitted && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-3"
              style={{ backgroundColor: secondary }}>
              👋
            </div>
            <h2 className="font-bold text-gray-900 mb-1">Before we start</h2>
            <p className="text-sm text-gray-500 mb-4">Please enter your email to continue the conversation.</p>
            <input className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': primary } as any}
              type="email" placeholder="your@email.com" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && email) setEmailSubmitted(true); }} />
            <button onClick={() => setEmailSubmitted(true)} disabled={!email}
              className="w-full py-2.5 rounded-xl text-white font-semibold disabled:opacity-50 transition-all"
              style={{ backgroundColor: primary }}>
              Start Chatting
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      {emailSubmitted && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-start gap-2'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: secondary }}>
                    {bot.avatar_url ? <img src={bot.avatar_url} className="w-7 h-7 rounded-full object-cover" alt="" /> : '🤖'}
                  </div>
                )}
                <div className={`max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'text-white' : ''}`}
                  style={{
                    backgroundColor: msg.role === 'user' ? primary : secondary,
                    color: msg.role === 'user' ? '#fff' : textColor,
                    borderRadius,
                    borderTopRightRadius: msg.role === 'user' ? '4px' : borderRadius,
                    borderTopLeftRadius: msg.role === 'assistant' ? '4px' : borderRadius,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                  {msg.role === 'assistant'
                    ? <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                    : msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                  style={{ backgroundColor: secondary }}>🤖</div>
                <div className="px-4 py-3 flex gap-1.5 items-center" style={{ backgroundColor: secondary, borderRadius, borderTopLeftRadius: '4px' }}>
                  <span className="w-2 h-2 rounded-full typing-dot" style={{ backgroundColor: primary }} />
                  <span className="w-2 h-2 rounded-full typing-dot" style={{ backgroundColor: primary }} />
                  <span className="w-2 h-2 rounded-full typing-dot" style={{ backgroundColor: primary }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 px-4 py-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-blue-300 transition-colors"
              style={{ '--border-focus': primary } as any}>
              <input ref={inputRef} className="flex-1 text-sm bg-transparent outline-none text-gray-800"
                placeholder={bot.placeholder_text || 'Type a message...'}
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                disabled={loading} maxLength={2000} />
              <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                style={{ backgroundColor: primary }}>
                {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
              </button>
            </div>
            {bot.show_branding && (
              <p className="text-center text-xs text-gray-300 mt-2">
                Powered by <a href="/" target="_blank" className="hover:text-gray-400">INTRA AI</a>
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
