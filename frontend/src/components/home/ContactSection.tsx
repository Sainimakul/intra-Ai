'use client';
import { useState } from 'react';
import { Mail, MessageSquare, Send, Loader2, CheckCircle, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users/contact', form);
      setSent(true);
      toast.success('Message sent! We\'ll reply within 24 hours.');
    } catch {
      toast.error('Failed to send. Please try emailing us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            ✉️ Get in touch
          </div>
          <h2 className="section-title">Contact Us</h2>
          <p className="section-subtitle mx-auto">Have a question or need help? We'd love to hear from you.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-5">Let's talk</h3>
              {[
                { icon: Mail, label: 'Email', value: 'hello@intra-ai.com', href: 'mailto:hello@intra-ai.com' },
                { icon: MessageSquare, label: 'Support', value: 'support@intra-ai.com', href: 'mailto:support@intra-ai.com' },
                { icon: Clock, label: 'Response time', value: 'Within 24 hours', href: null },
                { icon: MapPin, label: 'Based in', value: 'India 🇮🇳', href: null },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500">{item.label}</div>
                    {item.href
                      ? <a href={item.href} className="text-sm font-medium text-gray-800 hover:text-primary-600">{item.value}</a>
                      : <div className="text-sm font-medium text-gray-800">{item.value}</div>
                    }
                  </div>
                </div>
              ))}
            </div>

            <div className="card p-6 bg-primary-600 border-primary-600">
              <h4 className="font-bold text-white mb-2">Need enterprise support?</h4>
              <p className="text-primary-200 text-sm mb-4">Get a dedicated account manager, SLA guarantees, and custom integrations.</p>
              <a href="mailto:enterprise@intra-ai.com" className="inline-flex items-center gap-2 bg-white text-primary-700 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-primary-50 transition-colors">
                <Mail className="w-4 h-4" /> Contact sales
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="card p-10 text-center h-full flex flex-col items-center justify-center">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message sent!</h3>
                <p className="text-gray-500 mb-6">We'll get back to you at <strong>{form.email}</strong> within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="btn-secondary">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card p-7 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Your Name *</label>
                    <input className="input" placeholder="John Doe" value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label">Email Address *</label>
                    <input type="email" className="input" placeholder="you@example.com" value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                  </div>
                </div>
                <div>
                  <label className="label">Subject</label>
                  <input className="input" placeholder="How can we help?" value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Message *</label>
                  <textarea className="input resize-none" rows={5}
                    placeholder="Tell us more about your question or project..."
                    value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                    : <><Send className="w-4 h-4" /> Send message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
