'use client';

import { useSearchParams } from 'next/navigation';

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return <div>{token}</div>;
}