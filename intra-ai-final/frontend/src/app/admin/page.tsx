'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Bot, MessageSquare, DollarSign, TrendingUp, Activity, ArrowUpRight, Package, UserCheck, Zap } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const PLAN_COLORS = ['#2563EB', '#16a34a', '#9333ea'];

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [revenue, setRevenue] = useState<any[]>([]);

  useEffect(() => {
    api.get('/admin/stats').then(r => setData(r.data));
    api.get('/admin/revenue').then(r => setRevenue(r.data.monthly || []));
  }, []);

  const statCards = data ? [
    {
      label: 'Total Users',
      value: formatNumber(data.stats.totalUsers),
      delta: `+${data.stats.newUsersThisMonth} this month`,
      deltaPositive: true,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Active Bots',
      value: formatNumber(data.stats.totalBots),
      delta: 'across all accounts',
      deltaPositive: true,
      icon: Bot,
      color: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      label: 'Conversations',
      value: formatNumber(data.stats.totalConversations),
      delta: `${data.stats.activeConversationsToday} today`,
      deltaPositive: data.stats.activeConversationsToday > 0,
      icon: MessageSquare,
      color: 'from-emerald-500 to-green-600',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(data.stats.totalRevenue),
      delta: 'all time',
      deltaPositive: true,
      icon: DollarSign,
      color: 'from-orange-500 to-amber-500',
      bg: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ] : [];

  const chartData = revenue.slice(0, 6).reverse().map((d: any) => ({
    month: new Date(d.month).toLocaleDateString('en', { month: 'short', year: '2-digit' }),
    revenue: parseFloat(d.revenue),
    transactions: parseInt(d.transactions),
  }));

  const quickActions = [
    { href: '/admin/users',    icon: UserCheck,  label: 'Manage Users',     desc: 'View, ban, or change plans',     color: 'text-blue-600 bg-blue-50'    },
    { href: '/admin/plans',    icon: Package,    label: 'Edit Plans',        desc: 'Update pricing & features',      color: 'text-violet-600 bg-violet-50' },
    { href: '/admin/bots',     icon: Bot,        label: 'All Bots',          desc: 'Browse every bot on platform',   color: 'text-emerald-600 bg-emerald-50'},
    { href: '/admin/analytics',icon: TrendingUp, label: 'Revenue Charts',    desc: 'Monthly revenue breakdown',      color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Real-time stats across all users and bots.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {!data ? [...Array(4)].map((_,i) => <div key={i} className="card h-28 animate-pulse bg-gray-50" />) :
          statCards.map(s => (
            <div key={s.label} className="card p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
              {/* Subtle gradient background */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br ${s.color}`} />
              <div className="relative">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <div className="text-2xl font-extrabold text-gray-900 tabular-nums">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                <div className={`text-xs mt-1.5 font-medium ${s.deltaPositive ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {s.deltaPositive && '↑ '}{s.delta}
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Revenue bar chart */}
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Revenue (Last 6 months)</h3>
              <p className="text-xs text-gray-400 mt-0.5">Monthly payment totals</p>
            </div>
            <Link href="/admin/analytics" className="text-xs text-primary-600 hover:underline flex items-center gap-0.5">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {chartData.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-gray-300 text-sm">No revenue data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip
                  formatter={(v: any) => [formatCurrency(v), 'Revenue']}
                  contentStyle={{ borderRadius: '10px', fontSize: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="revenue" fill="#2563EB" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Plan distribution donut */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Users by Plan</h3>
              <p className="text-xs text-gray-400 mt-0.5">Current distribution</p>
            </div>
          </div>
          {!data?.planDistribution ? (
            <div className="h-44 animate-pulse bg-gray-50 rounded-xl" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={data.planDistribution} dataKey="count" nameKey="name"
                    cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                    paddingAngle={3}>
                    {data.planDistribution.map((_: any, i: number) => (
                      <Cell key={i} fill={PLAN_COLORS[i % PLAN_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 mt-1">
                {data.planDistribution.map((p: any, i: number) => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAN_COLORS[i % PLAN_COLORS.length] }} />
                      <span className="text-gray-600">{p.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{p.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick actions grid */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(a => (
            <Link key={a.href} href={a.href}
              className="card p-4 hover:shadow-md transition-all group hover:border-primary-100">
              <div className={`w-9 h-9 ${a.color} rounded-xl flex items-center justify-center mb-3`}>
                <a.icon className="w-4 h-4" />
              </div>
              <div className="font-semibold text-gray-900 text-sm group-hover:text-primary-700 transition-colors">{a.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{a.desc}</div>
              <div className="mt-2 text-xs text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                Open <ArrowUpRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
