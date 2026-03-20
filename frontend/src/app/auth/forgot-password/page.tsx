'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <div className="card p-10 max-w-md w-full text-center shadow-xl">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h2>
      <p className="text-gray-500 mb-6">If <strong>{email}</strong> is registered, you'll receive a reset link shortly.</p>
      <Link href="/auth/login" className="btn-primary w-full justify-center py-3">Back to login</Link>
    </div>
  );

  return (
    <div className="card p-8 max-w-md w-full shadow-xl">
      <Link href="/auth/login" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to login
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot password?</h1>
      <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send a reset link.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-10" type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send reset link'}
        </button>
      </form>
    </div>
  );
}
