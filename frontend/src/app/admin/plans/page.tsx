'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatCurrency, getErrorMessage } from '@/lib/utils';

const defaultForm = {
  name: '', slug: '', description: '', price_monthly: 0, price_yearly: 0,
  max_bots: 1, max_messages_per_month: 100, max_training_files: 5, max_file_size_mb: 10,
  allow_custom_domain: false, allow_url_scraping: false, allow_db_connect: false,
  allow_file_upload: true, allow_branding_removal: false, allow_analytics: false, allow_api_access: false,
  features: '', is_featured: false, sort_order: 99,
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<any>(defaultForm);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/plans').then(r => setPlans(r.data.plans || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const up = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const openEdit = (plan: any) => {
    setForm({ ...plan, features: Array.isArray(plan.features) ? plan.features.join('\n') : plan.features });
    setModal('edit');
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, features: form.features.split('\n').filter((f: string) => f.trim()) };
      if (modal === 'create') await api.post('/plans', payload);
      else await api.put(`/plans/${form.id}`, payload);
      toast.success(`Plan ${modal === 'create' ? 'created' : 'updated'}!`);
      setModal(null); load();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const deletePlan = async (id: string) => {
    if (!confirm('Delete this plan?')) return;
    try { await api.delete(`/plans/${id}`); toast.success('Plan deleted'); load(); }
    catch (err) { toast.error(getErrorMessage(err)); }
  };

  const Toggle = ({ field }: { field: string }) => (
    <button type="button" onClick={() => up(field, !form[field])}
      className={`relative w-10 h-5 rounded-full transition-colors ${form[field] ? 'bg-primary-600' : 'bg-gray-200'}`}>
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form[field] ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plans & Pricing</h1>
          <p className="text-gray-500 text-sm">Manage subscription plans and features.</p>
        </div>
        <button onClick={() => { setForm(defaultForm); setModal('create'); }} className="btn-primary">
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {loading ? [1,2,3].map(i => <div key={i} className="card p-5 h-48 animate-pulse bg-gray-50" />) :
          plans.map(plan => {
            const features = Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features || '[]');
            return (
              <div key={plan.id} className={`card p-5 relative ${plan.is_featured ? 'border-primary-300' : ''}`}>
                {plan.is_featured && <div className="absolute -top-2.5 left-4"><span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">Featured</span></div>}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-xs text-gray-400">{plan.slug}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(plan)} className="p-1.5 hover:bg-primary-50 rounded-lg text-gray-400 hover:text-primary-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deletePlan(plan.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {plan.price_monthly === 0 ? 'Free' : formatCurrency(plan.price_monthly)}<span className="text-sm font-normal text-gray-400">/mo</span>
                </div>
                <div className="text-xs text-gray-400 mb-3">{plan.price_yearly > 0 && `${formatCurrency(plan.price_yearly)}/yr`}</div>
                <div className="text-xs space-y-1 text-gray-500 border-t pt-3">
                  <div>{plan.max_bots} bot{plan.max_bots !== 1 ? 's' : ''} · {plan.max_messages_per_month.toLocaleString()} msgs/mo</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {plan.allow_url_scraping && <span className="badge bg-blue-50 text-blue-600">URL</span>}
                    {plan.allow_db_connect && <span className="badge bg-orange-50 text-orange-600">DB</span>}
                    {plan.allow_branding_removal && <span className="badge bg-green-50 text-green-600">No branding</span>}
                    {plan.allow_analytics && <span className="badge bg-purple-50 text-purple-600">Analytics</span>}
                    {plan.allow_api_access && <span className="badge bg-red-50 text-red-600">API</span>}
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-gray-900">{modal === 'create' ? 'Create Plan' : 'Edit Plan'}</h2>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Name</label><input className="input" value={form.name} onChange={e => up('name', e.target.value)} /></div>
                <div><label className="label">Slug</label><input className="input" value={form.slug} onChange={e => up('slug', e.target.value)} placeholder="free, pro, business" /></div>
              </div>
              <div><label className="label">Description</label><input className="input" value={form.description} onChange={e => up('description', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Price Monthly (₹)</label><input type="number" className="input" value={form.price_monthly} onChange={e => up('price_monthly', parseFloat(e.target.value))} /></div>
                <div><label className="label">Price Yearly (₹)</label><input type="number" className="input" value={form.price_yearly} onChange={e => up('price_yearly', parseFloat(e.target.value))} /></div>
                <div><label className="label">Max Bots</label><input type="number" className="input" value={form.max_bots} onChange={e => up('max_bots', parseInt(e.target.value))} /></div>
                <div><label className="label">Max Messages/Month</label><input type="number" className="input" value={form.max_messages_per_month} onChange={e => up('max_messages_per_month', parseInt(e.target.value))} /></div>
              </div>
              <div>
                <label className="label">Features (one per line)</label>
                <textarea className="input resize-none" rows={4} value={form.features} onChange={e => up('features', e.target.value)} placeholder="5 Chatbots&#10;5,000 messages/month&#10;PDF training" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'allow_url_scraping', label: 'URL Scraping' },
                  { key: 'allow_db_connect', label: 'DB Connection' },
                  { key: 'allow_branding_removal', label: 'Remove Branding' },
                  { key: 'allow_analytics', label: 'Analytics' },
                  { key: 'allow_api_access', label: 'API Access' },
                  { key: 'allow_custom_domain', label: 'Custom Domain' },
                  { key: 'is_featured', label: 'Featured (highlighted)' },
                ].map(f => (
                  <div key={f.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">{f.label}</span>
                    <Toggle field={f.key} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
