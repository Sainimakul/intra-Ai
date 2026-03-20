'use client';
import { useEffect, useState, useRef } from 'react';
import { Upload, Globe, Database, FileText, Trash2, Loader2, CheckCircle, XCircle, Clock, X, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import UpgradeModal from './UpgradeModal';

type Source = { id: string; type: string; name: string; status: string; file_size?: number; url?: string; chunks_count?: number; error_message?: string; created_at: string };
type Mode = 'none' | 'url' | 'db' | 'text';

export default function KnowledgeTab({ botId }: { botId: string }) {
  const { user } = useAuth();
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('none');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlForm, setUrlForm] = useState({ url: '', name: '' });
  const [dbForm, setDbForm] = useState({ connectionString: '', dbQuery: '', name: '' });
  const [textForm, setTextForm] = useState({ content: '', name: '' });
  const [upgradeModal, setUpgradeModal] = useState<string | null>(null);

  const load = () => api.get(`/knowledge/bot/${botId}`).then(r => setSources(r.data.sources || [])).finally(() => setLoading(false));
  useEffect(() => { load(); const int = setInterval(load, 5000); return () => clearInterval(int); }, []);

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    setUploading(true);
    try {
      await api.post(`/knowledge/upload/${botId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('File uploaded! Processing...'); load();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const addUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.allow_url_scraping !== true) { setUpgradeModal('url_scraping'); return; }
    setUploading(true);
    try {
      await api.post(`/knowledge/url/${botId}`, urlForm);
      toast.success('URL added! Scraping...'); setUrlForm({ url: '', name: '' }); setMode('none'); load();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setUploading(false); }
  };

  const addDb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.allow_db_connect !== true) { setUpgradeModal('db_connect'); return; }
    setUploading(true);
    try {
      await api.post(`/knowledge/database/${botId}`, dbForm);
      toast.success('Database connected! Querying...'); setDbForm({ connectionString: '', dbQuery: '', name: '' }); setMode('none'); load();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setUploading(false); }
  };

  const addText = async (e: React.FormEvent) => {
    e.preventDefault(); setUploading(true);
    try {
      await api.post(`/knowledge/text/${botId}`, textForm);
      toast.success('Text added!'); setTextForm({ content: '', name: '' }); setMode('none'); load();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setUploading(false); }
  };

  const deleteSource = async (id: string) => {
    if (!confirm('Delete this knowledge source?')) return;
    try { await api.delete(`/knowledge/${id}`); setSources(prev => prev.filter(s => s.id !== id)); toast.success('Source deleted'); }
    catch (err) { toast.error(getErrorMessage(err)); }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'ready') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'error') return <XCircle className="w-4 h-4 text-red-400" />;
    return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
  };

  return (
    <div className="space-y-5">
      {upgradeModal && <UpgradeModal open={true} onClose={() => setUpgradeModal(null)} feature={upgradeModal as any} />}

      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Add Knowledge Source</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* File upload - always available */}
          <button onClick={() => fileRef.current?.click()}
            className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all text-left group">
            <Upload className="w-5 h-5 text-gray-400 group-hover:text-primary-600 mb-2" />
            <div className="text-sm font-semibold text-gray-700 group-hover:text-primary-700">Upload File</div>
            <div className="text-xs text-gray-400">PDF, TXT, DOC</div>
          </button>

          {/* URL - Pro required */}
          <button onClick={() => user?.allow_url_scraping === true ? setMode(mode === 'url' ? 'none' : 'url') : setUpgradeModal('url_scraping')}
            className={`p-4 border-2 border-dashed rounded-xl transition-all text-left group relative ${
              user?.allow_url_scraping === true ? 'border-gray-200 hover:border-primary-400 hover:bg-primary-50' : 'border-gray-100 bg-gray-50 cursor-pointer'
            }`}>
            {!user?.allow_url_scraping && <Lock className="absolute top-2 right-2 w-3.5 h-3.5 text-gray-300" />}
            <Globe className={`w-5 h-5 mb-2 ${user?.allow_url_scraping === true ? 'text-gray-400 group-hover:text-primary-600' : 'text-gray-300'}`} />
            <div className={`text-sm font-semibold ${user?.allow_url_scraping ? 'text-gray-700 group-hover:text-primary-700' : 'text-gray-400'}`}>Website URL</div>
            <div className="text-xs text-gray-300">{user?.allow_url_scraping === true ? 'Scrape any URL' : 'Pro plan'}</div>
          </button>

          {/* Database - Business required */}
          <button onClick={() => user?.allow_db_connect === true ? setMode(mode === 'db' ? 'none' : 'db') : setUpgradeModal('db_connect')}
            className={`p-4 border-2 border-dashed rounded-xl transition-all text-left group relative ${
              user?.allow_db_connect === true ? 'border-gray-200 hover:border-primary-400 hover:bg-primary-50' : 'border-gray-100 bg-gray-50 cursor-pointer'
            }`}>
            {!user?.allow_db_connect && <Lock className="absolute top-2 right-2 w-3.5 h-3.5 text-gray-300" />}
            <Database className={`w-5 h-5 mb-2 ${user?.allow_db_connect === true ? 'text-gray-400 group-hover:text-primary-600' : 'text-gray-300'}`} />
            <div className={`text-sm font-semibold ${user?.allow_db_connect ? 'text-gray-700 group-hover:text-primary-700' : 'text-gray-400'}`}>Database</div>
            <div className="text-xs text-gray-300">{user?.allow_db_connect === true ? 'PostgreSQL/MySQL' : 'Business plan'}</div>
          </button>

          {/* Manual text - always available */}
          <button onClick={() => setMode(mode === 'text' ? 'none' : 'text')}
            className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all text-left group">
            <FileText className="w-5 h-5 text-gray-400 group-hover:text-primary-600 mb-2" />
            <div className="text-sm font-semibold text-gray-700 group-hover:text-primary-700">Manual Text</div>
            <div className="text-xs text-gray-400">Paste content</div>
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.docx" className="hidden" onChange={uploadFile} />

        {mode === 'url' && user?.allow_url_scraping === true && (
          <form onSubmit={addUrl} className="mt-4 p-4 bg-blue-50 rounded-xl space-y-3">
            <div className="flex justify-between items-center"><h4 className="font-medium text-blue-900">Add Website URL</h4><button type="button" onClick={() => setMode('none')}><X className="w-4 h-4 text-blue-700" /></button></div>
            <input className="input" placeholder="https://yoursite.com/page" value={urlForm.url} onChange={e => setUrlForm(p => ({ ...p, url: e.target.value }))} required />
            <input className="input" placeholder="Name (optional)" value={urlForm.name} onChange={e => setUrlForm(p => ({ ...p, name: e.target.value }))} />
            <button type="submit" disabled={uploading} className="btn-primary w-full">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Scraping...</> : 'Scrape & Add'}
            </button>
          </form>
        )}
        {mode === 'db' && user?.allow_db_connect === true && (
          <form onSubmit={addDb} className="mt-4 p-4 bg-orange-50 rounded-xl space-y-3">
            <div className="flex justify-between items-center"><h4 className="font-medium text-orange-900">Connect Database</h4><button type="button" onClick={() => setMode('none')}><X className="w-4 h-4 text-orange-700" /></button></div>
            <input className="input" placeholder="postgresql://user:password@host:5432/dbname" value={dbForm.connectionString} onChange={e => setDbForm(p => ({ ...p, connectionString: e.target.value }))} required />
            <textarea className="input resize-none" rows={2} placeholder="SELECT * FROM faq_table LIMIT 500 (optional)" value={dbForm.dbQuery} onChange={e => setDbForm(p => ({ ...p, dbQuery: e.target.value }))} />
            <input className="input" placeholder="Source name (optional)" value={dbForm.name} onChange={e => setDbForm(p => ({ ...p, name: e.target.value }))} />
            <p className="text-xs text-orange-700">⚠️ Connection strings are stored securely. Use a read-only DB user.</p>
            <button type="submit" disabled={uploading} className="btn-primary w-full">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</> : 'Connect & Query'}
            </button>
          </form>
        )}
        {mode === 'text' && (
          <form onSubmit={addText} className="mt-4 p-4 bg-green-50 rounded-xl space-y-3">
            <div className="flex justify-between items-center"><h4 className="font-medium text-green-900">Add Manual Text</h4><button type="button" onClick={() => setMode('none')}><X className="w-4 h-4 text-green-700" /></button></div>
            <input className="input" placeholder="Source name" value={textForm.name} onChange={e => setTextForm(p => ({ ...p, name: e.target.value }))} />
            <textarea className="input resize-none" rows={5} placeholder="Paste your content here..." value={textForm.content} onChange={e => setTextForm(p => ({ ...p, content: e.target.value }))} required />
            <button type="submit" disabled={uploading} className="btn-primary w-full">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : 'Add Text'}
            </button>
          </form>
        )}
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Knowledge Sources ({sources.length})</h3>
        {loading ? (
          <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}</div>
        ) : sources.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No knowledge sources yet. Add one above to train your bot.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sources.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <StatusIcon status={s.status} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{s.name}</div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="capitalize badge bg-gray-100 text-gray-600">{s.type}</span>
                    {s.chunks_count ? <span>{s.chunks_count} chunks</span> : null}
                    {s.status === 'error' && <span className="text-red-500 truncate">{s.error_message}</span>}
                    {s.status === 'processing' && <span className="text-yellow-600">Processing...</span>}
                  </div>
                </div>
                <button onClick={() => deleteSource(s.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
