'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, Users, Package, Bot, BarChart3, ArrowLeft,
  LayoutDashboard, Menu, X, TrendingUp, Bell
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';

const adminNav = [
  { href: '/admin',            icon: LayoutDashboard, label: 'Overview',  exact: true },
  { href: '/admin/users',      icon: Users,           label: 'Users'               },
  { href: '/admin/plans',      icon: Package,         label: 'Plans'               },
  { href: '/admin/bots',       icon: Bot,             label: 'All Bots'            },
  { href: '/admin/analytics',  icon: BarChart3,       label: 'Revenue'             },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !['admin', 'superadmin'].includes(user.role))) {
      router.push('/dashboard');
    }
  }, [user, loading]);

  if (loading || !user) return null;

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  const currentPage = adminNav.find(n => isActive(n.href, n.exact))?.label || 'Admin';

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center">
            <Shield className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Admin Panel</div>
            <div className="text-xs text-slate-500">INTRA AI</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {adminNav.map(item => {
          const active = isActive(item.href, item.exact);
          return (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}>
              <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {item.label}
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Divider + back */}
      <div className="px-3 pb-4 border-t border-slate-800 pt-3 space-y-1">
        <Link href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all group">
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
          Back to Dashboard
        </Link>

        {/* Admin user footer */}
        <div className="flex items-center gap-3 px-3 py-2 mt-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user.name}</div>
            <div className="text-xs text-slate-500 truncate capitalize">{user.role}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 shadow-lg">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-56 shadow-2xl">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-800 z-10">
              <X className="w-4 h-4 text-slate-400" />
            </button>
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 h-14 px-4 md:px-6 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-5 h-5 bg-red-100 rounded-md flex items-center justify-center">
                <Shield className="w-3 h-3 text-red-500" />
              </div>
              <span className="text-sm font-semibold text-gray-700">{currentPage}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg font-semibold">
              <Shield className="w-3 h-3" /> Admin
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {getInitials(user.name)}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
