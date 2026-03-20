'use client';
import { useState } from 'react';
import { Mail, X, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function VerifyEmailModal({ open, onClose }: Props) {
  const { user, refreshUser } = useAuth();
  const [resending, setResending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const resend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification');
      setSent(true);
      toast.success('Verification email sent!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-gray-100 text-gray-400">
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Mail className="w-8 h-8 text-yellow-500" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">Verify your email first</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-2">
            You need to verify <strong className="text-gray-700">{user?.email}</strong> before creating a bot.
          </p>
          <p className="text-gray-400 text-xs mb-6">
            Check your inbox for a verification link. Didn't get it?
          </p>

          {sent ? (
            <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 rounded-xl py-3 px-4 mb-4">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Email sent! Check your inbox.</span>
            </div>
          ) : (
            <button onClick={resend} disabled={resending}
              className="btn-primary w-full py-3 mb-3">
              {resending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                : <><RefreshCw className="w-4 h-4" /> Resend verification email</>}
            </button>
          )}

          <button onClick={onClose}
            className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors">
            I'll do it later
          </button>
        </div>
      </div>
    </div>
  );
}
