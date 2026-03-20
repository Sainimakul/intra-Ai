'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [resending, setResending] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    if (token) {
      setStatus('loading');
      api.post('/auth/verify-email', { token })
        .then(() => { setStatus('success'); refreshUser(); })
        .catch(() => setStatus('error'));
    }
  }, [token]);

  const resend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification');
      toast.success('Verification email sent!');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  if (status === 'loading') return (
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-800">Verifying your email...</h2>
    </div>
  );

  if (status === 'success') return (
    <div className="card p-10 max-w-md w-full text-center shadow-xl">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Email verified!</h2>
      <p className="text-gray-500 mb-6">Your email has been verified successfully. You can now use all features.</p>
      <Link href="/dashboard" className="btn-primary w-full justify-center py-3">Go to Dashboard</Link>
    </div>
  );

  if (status === 'error') return (
    <div className="card p-10 max-w-md w-full text-center shadow-xl">
      <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Link expired</h2>
      <p className="text-gray-500 mb-6">This verification link is invalid or has expired. Request a new one below.</p>
      {user && (
        <button onClick={resend} disabled={resending} className="btn-primary w-full justify-center py-3">
          {resending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Resend verification email'}
        </button>
      )}
      <Link href="/auth/login" className="btn-secondary w-full justify-center py-3 mt-3">Back to login</Link>
    </div>
  );

  return (
    <div className="card p-10 max-w-md w-full text-center shadow-xl">
      <Mail className="w-16 h-16 text-primary-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
      <p className="text-gray-500 mb-6">
        We sent a verification link to <strong>{user?.email}</strong>. Click the link to activate your account.
      </p>
      <button onClick={resend} disabled={resending} className="btn-secondary w-full justify-center py-3">
        {resending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Resend email'}
      </button>
      <Link href="/dashboard" className="block mt-3 text-sm text-gray-400 hover:text-gray-600">Skip for now</Link>
    </div>
  );
}
