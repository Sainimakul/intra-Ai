import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
}

export function formatCurrency(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
}

export function formatNumber(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

export function truncate(str: string, len = 50) {
  return str.length > len ? str.slice(0, len) + '...' : str;
}

export function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function generateSessionId() {
  return 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getErrorMessage(error: unknown): string {
  if (axios_like(error)) return error?.response?.data?.error || error?.message || 'Something went wrong';
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

function axios_like(e: unknown): e is { response?: { data?: { error?: string } }; message?: string } {
  return typeof e === 'object' && e !== null;
}
