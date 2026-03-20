'use client';
import { useState } from 'react';
import { Send, Lock, Check, Zap, Smile } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UpgradeModal from './UpgradeModal';

// ─── Predefined themes ────────────────────────────────────────────────────────
const THEMES = [
  { id: 'ocean',    name: 'Ocean',     primary: '#2563EB', secondary: '#DBEAFE', text: '#1F2937', free: true  },
  { id: 'forest',   name: 'Forest',    primary: '#16a34a', secondary: '#DCFCE7', text: '#1F2937', free: true  },
  { id: 'sunset',   name: 'Sunset',    primary: '#ea580c', secondary: '#FED7AA', text: '#1F2937', free: true  },
  { id: 'violet',   name: 'Violet',    primary: '#7c3aed', secondary: '#EDE9FE', text: '#1F2937', free: false },
  { id: 'rose',     name: 'Rose',      primary: '#e11d48', secondary: '#FFE4E6', text: '#1F2937', free: false },
  { id: 'midnight', name: 'Midnight',  primary: '#0f172a', secondary: '#e2e8f0', text: '#0f172a', free: false },
  { id: 'teal',     name: 'Teal',      primary: '#0891b2', secondary: '#CFFAFE', text: '#1F2937', free: false },
  { id: 'gold',     name: 'Gold',      primary: '#b45309', secondary: '#FEF3C7', text: '#1F2937', free: false },
  { id: 'slate',    name: 'Slate',     primary: '#475569', secondary: '#F1F5F9', text: '#1e293b', free: false },
];

// ─── Bot avatar icons ─────────────────────────────────────────────────────────
const ICONS = [
  { id: 'robot',    emoji: '🤖', label: 'Robot',    free: true  },
  { id: 'sparkle',  emoji: '✨', label: 'Sparkle',  free: true  },
  { id: 'star',     emoji: '⭐', label: 'Star',     free: true  },
  { id: 'brain',    emoji: '🧠', label: 'Brain',    free: false },
  { id: 'lightning',emoji: '⚡', label: 'Lightning',free: false },
  { id: 'diamond',  emoji: '💎', label: 'Diamond',  free: false },
  { id: 'fire',     emoji: '🔥', label: 'Fire',     free: false },
  { id: 'shield',   emoji: '🛡️', label: 'Shield',   free: false },
  { id: 'rocket',   emoji: '🚀', label: 'Rocket',   free: false },
  { id: 'leaf',     emoji: '🌿', label: 'Leaf',     free: false },
  { id: 'globe',    emoji: '🌍', label: 'Globe',    free: false },
  { id: 'smile',    emoji: '😊', label: 'Friendly', free: false },
];

const BubbleRadius: Record<string, string> = {
  rounded: '18px', square: '6px', pill: '999px',
};

export default function AppearanceTab({ form, setForm }: { form: any; setForm: any }) {
  const { user } = useAuth();
  const [upgradeModal, setUpgradeModal] = useState(false);
  const isPaid = user?.allow_branding_removal === true;      // Pro+
  const isBusiness = user?.allow_api_access === true;        // Business only (full customization)

  const up = (key: string, val: any) => setForm((p: any) => ({ ...p, [key]: val }));

  const applyTheme = (theme: typeof THEMES[0]) => {
    if (!theme.free && !isPaid) { setUpgradeModal(true); return; }
    up('primary_color', theme.primary);
    up('secondary_color', theme.secondary);
    up('text_color', theme.text);
  };

  const applyIcon = (icon: typeof ICONS[0]) => {
    if (!icon.free && !isPaid) { setUpgradeModal(true); return; }
    up('bot_icon', icon.emoji);
  };

  const currentIcon = form.bot_icon || '🤖';
  const br = form.bubble_style;
  const radius = BubbleRadius[br] || BubbleRadius.rounded;
  const radiiBot = { borderRadius: radius, borderTopLeftRadius: br === 'pill' ? radius : '4px' };
  const radiiUser = { borderRadius: radius, borderTopRightRadius: br === 'pill' ? radius : '4px' };

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {upgradeModal && <UpgradeModal open onClose={() => setUpgradeModal(false)} feature="branding" />}

      {/* ── Controls (3 cols) ── */}
      <div className="lg:col-span-3 space-y-5">

        {/* Themes */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Theme</h3>
            {!isPaid && <span className="text-xs text-gray-400 flex items-center gap-1"><Lock className="w-3 h-3" /> 3 free · 6 more on Pro</span>}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
            {THEMES.map(t => {
              const locked = !t.free && !isPaid;
              const active = form.primary_color === t.primary && form.secondary_color === t.secondary;
              return (
                <button key={t.id} onClick={() => applyTheme(t)}
                  title={locked ? `${t.name} — Pro plan` : t.name}
                  className={`relative group flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
                    active ? 'border-primary-500 shadow-md' : 'border-gray-100 hover:border-gray-300'
                  } ${locked ? 'opacity-60' : ''}`}>
                  {/* Color swatch */}
                  <div className="w-full h-8 rounded-lg flex overflow-hidden">
                    <div className="w-1/2 h-full" style={{ backgroundColor: t.primary }} />
                    <div className="w-1/2 h-full" style={{ backgroundColor: t.secondary }} />
                  </div>
                  <span className="text-xs font-medium text-gray-600">{t.name}</span>
                  {active && <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>}
                  {locked && <div className="absolute inset-0 rounded-xl flex items-center justify-center"><Lock className="w-3.5 h-3.5 text-gray-400" /></div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bot Icon */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Bot Icon</h3>
            {!isPaid && <span className="text-xs text-gray-400 flex items-center gap-1"><Lock className="w-3 h-3" /> 3 free</span>}
          </div>
          <div className="grid grid-cols-6 gap-2">
            {ICONS.map(ic => {
              const locked = !ic.free && !isPaid;
              const active = currentIcon === ic.emoji;
              return (
                <button key={ic.id} onClick={() => applyIcon(ic)}
                  title={locked ? `${ic.label} — Pro plan` : ic.label}
                  className={`relative h-12 rounded-xl border-2 text-xl flex items-center justify-center transition-all ${
                    active ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                  } ${locked ? 'opacity-50' : ''}`}>
                  {ic.emoji}
                  {locked && <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center"><Lock className="w-2.5 h-2.5 text-gray-500" /></div>}
                  {active && <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>}
                </button>
              );
            })}
          </div>

          {/* Custom avatar URL — Business only */}
          <div className={`mt-4 ${!isBusiness ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Custom avatar URL</label>
              {!isBusiness && <span className="badge bg-purple-100 text-purple-700 text-xs">Business</span>}
            </div>
            <input className="input text-sm" placeholder="https://example.com/avatar.png"
              value={form.avatar_url || ''}
              disabled={!isBusiness}
              onChange={e => up('avatar_url', e.target.value)} />
            {!isBusiness && (
              <button onClick={() => setUpgradeModal(true)} className="mt-2 text-xs text-purple-600 flex items-center gap-1 hover:underline">
                <Zap className="w-3 h-3" /> Business plan for custom avatar
              </button>
            )}
          </div>
        </div>

        {/* Style & Layout — Pro only for full access */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Style & Layout</h3>
{!isBusiness && <span className="text-xs text-gray-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Full control on Business</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Bubble style — free */}
            <div>
              <label className="label">Bubble style</label>
              <div className="flex gap-2">
                {['rounded','square','pill'].map(s => (
                  <button key={s} onClick={() => up('bubble_style', s)}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border-2 capitalize transition-all ${form.bubble_style === s || (!form.bubble_style && s === 'rounded') ? 'border-primary-500 text-primary-700 bg-primary-50' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Position — free */}
            <div>
              <label className="label">Widget position</label>
              <select className="input text-sm" value={form.position || 'bottom-right'} onChange={e => up('position', e.target.value)}>
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>

            {/* Font — Business only */}
            <div className={`col-span-2 ${!isBusiness ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Font family</label>
                {!isBusiness && <span className="badge bg-purple-100 text-purple-700 text-xs">Business</span>}
              </div>
              <select className="input text-sm" value={form.font_family || 'Inter'} disabled={!isBusiness} onChange={e => up('font_family', e.target.value)}>
                {['Inter','Roboto','Open Sans','Poppins','Nunito','System UI'].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>

            {/* Custom colors — Business only */}
            {isBusiness && (
              <div className="col-span-2">
                <label className="label">Fine-tune colors</label>
                <div className="grid grid-cols-3 gap-3">
                  {[{k:'primary_color',l:'Primary'},{k:'secondary_color',l:'Secondary'},{k:'text_color',l:'Text'}].map(c => (
                    <div key={c.k}>
                      <div className="text-xs text-gray-500 mb-1">{c.l}</div>
                      <div className="flex items-center gap-1.5">
                        <input type="color" value={form[c.k] || '#2563EB'} onChange={e => up(c.k, e.target.value)} className="w-9 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5 flex-shrink-0" />
                        <input className="input text-xs px-2 py-1.5 flex-1 min-w-0" value={form[c.k] || ''} onChange={e => up(c.k, e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Branding toggle */}
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                Show INTRA AI branding
                {!isPaid && <span className="badge bg-primary-100 text-primary-700 text-xs">Pro</span>}
              </div>
              <div className="text-xs text-gray-500">Display "Powered by INTRA AI" footer in widget</div>
            </div>
            {isPaid ? (
              <button onClick={() => up('show_branding', !form.show_branding)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.show_branding ? 'bg-primary-600' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.show_branding ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            ) : (
              <button onClick={() => setUpgradeModal(true)} className="flex items-center gap-1.5 text-xs text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 font-medium">
                <Lock className="w-3 h-3" /> Upgrade
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Live Preview (2 cols) ── */}
      <div className="lg:col-span-2">
        <div className="sticky top-4">
          <h3 className="font-semibold text-gray-900 mb-3">Live Preview</h3>
          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100" style={{ fontFamily: form.font_family || 'Inter' }}>
            {/* Chat header */}
            <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: form.primary_color || '#2563EB' }}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base">{currentIcon}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{form.bot_name || 'AI Assistant'}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-300" />
                  <span className="text-xs text-white/70">Online</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-gray-50 px-4 py-4 space-y-3 min-h-36">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: form.primary_color || '#2563EB' }}>{currentIcon}</div>
                <div className="px-3 py-2 text-xs max-w-[80%]" style={{ backgroundColor: form.secondary_color || '#DBEAFE', color: form.text_color || '#1F2937', ...radiiBot }}>
                  {form.welcome_message || 'Hello! How can I help you today?'}
                </div>
              </div>
              <div className="flex justify-end items-end gap-2">
                <div className="px-3 py-2 text-xs text-white max-w-[70%]" style={{ backgroundColor: form.primary_color || '#2563EB', ...radiiUser }}>
                  I need some help please.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: form.primary_color || '#2563EB' }}>{currentIcon}</div>
                <div className="px-3 py-2 text-xs max-w-[80%]" style={{ backgroundColor: form.secondary_color || '#DBEAFE', color: form.text_color || '#1F2937', ...radiiBot }}>
                  Of course! I'm here to help. What do you need?
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div className="bg-white border-t border-gray-100 px-3 py-2.5 flex items-center gap-2">
              <input className="flex-1 text-xs outline-none text-gray-400 bg-transparent" placeholder={form.placeholder_text || 'Type your message...'} disabled />
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: form.primary_color || '#2563EB' }}>
                <Send className="w-3 h-3" />
              </div>
            </div>
            {form.show_branding && <div className="bg-white text-center py-1.5 text-xs text-gray-300 border-t border-gray-50">Powered by INTRA AI</div>}
          </div>

          {/* Widget bubble preview */}
          <div className="flex items-center justify-between mt-4 px-1">
            <span className="text-xs text-gray-400">Widget bubble</span>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg" style={{ backgroundColor: form.primary_color || '#2563EB' }}>
              {currentIcon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
