import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import VerifyEmailClient from './VerifyEmailClient';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">Loading...</h2>
      </div>
    }>
      <VerifyEmailClient />
    </Suspense>
  );
}