import Link from 'next/link';
import { ArrowRight, Bot, Twitter, Linkedin, Github, Mail } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-24 bg-primary-600 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-30" />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Ready to build your AI chatbot?
        </h2>
        <p className="text-primary-200 text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of businesses using INTRA AI. Start free today — no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/register"
            className="bg-white text-primary-700 hover:bg-primary-50 font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg flex items-center gap-2">
            Get started for free <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="mailto:hello@intra-ai.com"
            className="border border-primary-400 text-white hover:bg-primary-500 font-semibold px-8 py-3.5 rounded-xl transition-all flex items-center gap-2">
            <Mail className="w-4 h-4" /> Contact sales
          </a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">INTRA <span className="text-primary-400">AI</span></span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Build, train, and deploy intelligent AI chatbots for your business. Powered by Google Gemini.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© {new Date().getFullYear()} INTRA AI. All rights reserved.</p>
          <p>Built with ❤️ in India · Powered by Google Gemini AI</p>
        </div>
      </div>
    </footer>
  );
}

export default CTASection;
