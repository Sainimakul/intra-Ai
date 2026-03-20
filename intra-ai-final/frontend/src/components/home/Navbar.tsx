'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Bot, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How it works' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-primary-700 transition-colors">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">INTRA <span className="text-primary-600">AI</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link href="/dashboard" className="btn-primary text-sm px-4 py-2">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-primary-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
                  Sign in
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm px-4 py-2">
                  Get started free
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-slide-up">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                {l.label}
              </a>
            ))}
            <hr className="my-3 border-gray-100" />
            {user ? (
              <Link href="/dashboard" className="btn-primary w-full text-sm">Dashboard</Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn-secondary w-full text-sm">Sign in</Link>
                <Link href="/auth/register" className="btn-primary w-full text-sm mt-2">Get started free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
