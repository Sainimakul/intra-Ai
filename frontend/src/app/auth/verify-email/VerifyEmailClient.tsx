'use client';

import { useSearchParams } from 'next/navigation';

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return <div>{token}</div>;
}