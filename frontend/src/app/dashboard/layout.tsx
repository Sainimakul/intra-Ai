'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Bot, LayoutDashboard, CreditCard, Settings, LogOut,
  Menu, X, Shield, Bell, Zap, MessageSquare, ChevronRight, Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getInitials, formatDate } from '@/lib/utils';
import UpgradeModal from '@/components/dashboard/UpgradeModal';
import PlanDowngradedModal from '@/components/dashboard/PlanDowngradedModal';

const navItems = [
  { href: '/dashboard',          icon: LayoutDashboard, label: 'Overview',       exact: true },
  { href: '/dashboard/bots',     icon: Bot,             label: 'My Bots'                     },
  { href: '/dashboard/messages', icon: MessageSquare,   label: 'Messages'                    },
  { href: '/dashboard/billing',  icon: CreditCard,      label: 'Billing & Plans'             },
  { href: '/dashboard/settings', icon: Settings,        label: 'Settings'                    },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState(false);

  useEffect(() => { if (!loading && !user) router.push('/auth/login'); }, [user, loading]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  const usagePct = user.max_messages_per_month
    ? Math.min(100, ((user.messages_used_this_month || 0) / user.max_messages_per_month) * 100)
    : 0;
  const nearLimit = usagePct >= 80;
  const isFree = !user.plan_slug || user.plan_slug === 'free';

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-white">

      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-blue-500 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-base font-extrabold text-gray-900 tracking-tight">INTRA<span className="text-primary-600">AI</span></span>
          </div>
        </Link>
      </div>

      {/* Free plan upgrade banner */}
      {isFree && (
        <div className="mx-3 mt-3 mb-1">
          <button onClick={() => setUpgradeModal(true)}
            className="w-full bg-gradient-to-r from-primary-600 to-blue-500 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 group hover:shadow-md transition-all">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-xs font-bold text-white">Upgrade to Pro</div>
              <div className="text-xs text-primary-200">5 bots · 5K messages/mo</div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white transition-colors flex-shrink-0" />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map(item => {
          const active = isActive(item.href, item.exact);
          return (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <item.icon className={`w-4 h-4 flex-shrink-0 transition-colors ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span>{item.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />}
            </Link>
          );
        })}

        {/* Admin link */}
        {['admin', 'superadmin'].includes(user.role) && (
          <>
            <div className="pt-3 pb-1 px-3">
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Admin</span>
            </div>
            <Link href="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname.startsWith('/admin') ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <Shield className={`w-4 h-4 flex-shrink-0 ${pathname.startsWith('/admin') ? 'text-red-500' : 'text-gray-400'}`} />
              Admin Panel
            </Link>
          </>
        )}
      </nav>

      {/* Usage meter */}
      <div className="px-3 pb-3">
        <div className={`rounded-xl p-3 ${nearLimit ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center mb-1.5">
            <span className={`text-xs font-semibold ${nearLimit ? 'text-amber-700' : 'text-gray-600'}`}>
              {user.plan_name || 'Free'} Plan
            </span>
            {user.plan_slug !== 'business' && (
              <button onClick={() => setUpgradeModal(true)} className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5" /> Upgrade
              </button>
            )}
          </div>
          {user.max_messages_per_month && (
            <>
              <div className="flex justify-between text-xs mb-1.5" style={{ color: nearLimit ? '#92400e' : '#6b7280' }}>
                <span>Messages</span>
                <span>{user.messages_used_this_month || 0} / {user.max_messages_per_month}</span>
              </div>
              <div className={`w-full h-1.5 rounded-full ${nearLimit ? 'bg-amber-200' : 'bg-gray-200'}`}>
                <div className={`h-1.5 rounded-full transition-all ${nearLimit ? 'bg-amber-500' : 'bg-primary-500'}`}
                  style={{ width: `${usagePct}%` }} />
              </div>
              {nearLimit && (
                <p className="text-xs text-amber-700 mt-1.5">
                  Running low — <button onClick={() => setUpgradeModal(true)} className="underline font-semibold">upgrade</button>
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* User footer */}
      <div className="px-3 pb-3 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
            {getInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-800 truncate">{user.name}</div>
            <div className="text-xs text-gray-400 truncate">{user.email}</div>
          </div>
          <button onClick={logout} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <UpgradeModal open={upgradeModal} onClose={() => setUpgradeModal(false)} />
      <PlanDowngradedModal />

      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-60 border-r border-gray-100 flex-shrink-0 shadow-sm">
          <Sidebar />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="relative w-64 shadow-2xl">
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-gray-100 z-10">
                <X className="w-4 h-4 text-gray-500" />
              </button>
              <Sidebar />
            </aside>
          </div>
        )}

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Top bar */}
          <header className="bg-white border-b border-gray-100 h-14 px-4 md:px-6 flex items-center justify-between flex-shrink-0 shadow-sm">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <Menu className="w-5 h-5" />
            </button>

            {/* Page breadcrumb (desktop) */}
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
              <span className="font-medium text-gray-600">
                {navItems.find(n => isActive(n.href, n.exact))?.label || 'Dashboard'}
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Email verify badge */}
              {!user.is_verified && (
                <Link href="/auth/verify-email"
                  className="hidden sm:flex items-center gap-1.5 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1.5 rounded-lg hover:bg-yellow-100 font-medium">
                  <Bell className="w-3 h-3" /> Verify email
                </Link>
              )}

              {/* Upgrade pill (non-business) */}
              {user.plan_slug !== 'business' && (
                <button onClick={() => setUpgradeModal(true)}
                  className="hidden sm:flex items-center gap-1.5 text-xs bg-gradient-to-r from-primary-600 to-blue-500 text-white px-3.5 py-1.5 rounded-lg font-semibold hover:shadow-md transition-all">
                  <Zap className="w-3 h-3" />
                  {isFree ? 'Upgrade' : 'Manage plan'}
                </button>
              )}

              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {getInitials(user.name)}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
