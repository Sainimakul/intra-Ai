'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function AdminBotsPage() {
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/admin/bots').then(r => setBots(r.data.bots || [])).finally(() => setLoading(false)); }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Bots</h1>
          <p className="text-gray-500 text-sm">{bots.length} bots across all users</p>
        </div>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Bot', 'Owner', 'Status', 'Messages', 'Conversations', 'Created'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-8 bg-gray-50 animate-pulse rounded" /></td></tr>) :
              bots.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{b.name}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs">{b.owner_name}</div>
                    <div className="text-xs text-gray-400">{b.owner_email}</div>
                  </td>
                  <td className="px-4 py-3"><span className={`badge text-xs ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{b.is_active ? 'Active' : 'Paused'}</span></td>
                  <td className="px-4 py-3 text-gray-600">{b.total_messages}</td>
                  <td className="px-4 py-3 text-gray-600">{b.total_conversations}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(b.created_at)}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminAnalyticsPage() {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => { api.get('/admin/revenue').then(r => setData(r.data.monthly || [])); }, []);

  const chartData = data.map(d => ({
    month: new Date(d.month).toLocaleDateString('en', { month: 'short', year: '2-digit' }),
    revenue: parseFloat(d.revenue),
    transactions: parseInt(d.transactions),
  }));

  const totalRevenue = data.reduce((s, d) => s + parseFloat(d.revenue), 0);
  const totalTransactions = data.reduce((s, d) => s + parseInt(d.transactions), 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
          <p className="text-gray-500 text-sm">Monthly revenue overview</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
          <div className="text-sm text-gray-500">Total Revenue</div>
        </div>
        <div className="card p-5">
          <div className="text-2xl font-bold text-gray-900">{totalTransactions}</div>
          <div className="text-sm text-gray-500">Total Transactions</div>
        </div>
      </div>
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400">No revenue data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default AdminBotsPage;
