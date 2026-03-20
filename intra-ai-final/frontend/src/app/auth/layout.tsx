import Link from 'next/link';
import { Bot } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex flex-col">
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">INTRA <span className="text-primary-600">AI</span></span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>
      <footer className="p-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} INTRA AI · <Link href="/privacy" className="hover:text-gray-600">Privacy</Link> · <Link href="/terms" className="hover:text-gray-600">Terms</Link>
      </footer>
    </div>
  );
}
