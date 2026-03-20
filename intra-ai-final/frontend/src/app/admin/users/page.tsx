'use client';
import { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, Trash2, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDate, getErrorMessage } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);

  const load = () => {
    setLoading(true);
    api.get(`/admin/users?page=${page}&search=${search}&status=${status}`)
      .then(r => { setUsers(r.data.users); setTotal(r.data.total); setTotalPages(r.data.totalPages); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { api.get('/plans').then(r => setPlans(r.data.plans || [])); }, []);
  useEffect(() => { load(); }, [page, search, status]);

  const updateUser = async (userId: string, updates: any) => {
    try {
      await api.patch(`/admin/users/${userId}`, updates);
      toast.success('User updated');
      load();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user and all their data?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      load();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm">{total} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9 w-64" placeholder="Search by name or email..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="input w-40" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All users</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['User', 'Plan', 'Status', 'Bots', 'Messages', 'Joined', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-8 bg-gray-50 rounded animate-pulse" /></td></tr>
              ))
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{u.name}</div>
                  <div className="text-xs text-gray-400">{u.email}</div>
                  {u.role !== 'user' && (
                    <span className="badge bg-red-100 text-red-600 mt-0.5"><Shield className="w-2.5 h-2.5 inline mr-0.5" />{u.role}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white"
                    value={u.plan_slug || 'free'}
                    onChange={e => {
                      const plan = plans.find(p => p.slug === e.target.value);
                      if (plan) updateUser(u.id, { plan_id: plan.id });
                    }}>
                    {plans.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className={`badge text-xs ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {!u.is_verified && <span className="badge text-xs bg-yellow-100 text-yellow-700">Unverified</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.bot_count}</td>
                <td className="px-4 py-3 text-gray-600">{u.messages_used_this_month}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => updateUser(u.id, { is_active: !u.is_active })}
                      className={`p-1.5 rounded-lg transition-colors ${u.is_active ? 'hover:bg-red-50 text-gray-400 hover:text-red-500' : 'hover:bg-green-50 text-gray-400 hover:text-green-500'}`}
                      title={u.is_active ? 'Disable' : 'Enable'}>
                      {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                    <button onClick={() => deleteUser(u.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
