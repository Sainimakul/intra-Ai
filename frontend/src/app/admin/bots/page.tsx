'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminBotsPage() {
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
