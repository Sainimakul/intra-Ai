'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';


export default function AdminAnalyticsPage() {
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