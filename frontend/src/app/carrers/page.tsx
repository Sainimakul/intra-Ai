import Navbar from '@/components/home/Navbar';
import { Footer } from '@/components/home/CTASection';
import { MapPin, Clock, IndianRupee } from 'lucide-react';

const openRoles = [
  {
    title: 'Full Stack Engineer',
    type: 'Full-time',
    location: 'Remote (India)',
    salary: '12–20 LPA',
    desc: 'Build and scale the INTRA AI platform. You\'ll work across Next.js frontend, Node.js backend, and PostgreSQL. Strong TypeScript skills required.',
    skills: ['Next.js', 'Node.js', 'TypeScript', 'PostgreSQL'],
  },
  {
    title: 'AI/ML Engineer',
    type: 'Full-time',
    location: 'Remote (India)',
    salary: '15–25 LPA',
    desc: 'Work on training pipelines, knowledge retrieval, and improving AI response quality. Experience with LLMs and vector databases is a plus.',
    skills: ['Python', 'LLMs', 'Prompt Engineering', 'Vector DB'],
  },
  {
    title: 'Growth Marketer',
    type: 'Full-time',
    location: 'Remote (India)',
    salary: '8–14 LPA',
    desc: 'Drive acquisition and retention for INTRA AI. Own SEO, content, email campaigns, and community building.',
    skills: ['SEO', 'Content', 'Email Marketing', 'Analytics'],
  },
  {
    title: 'Customer Success Manager',
    type: 'Full-time',
    location: 'Remote (India)',
    salary: '6–10 LPA',
    desc: 'Help our customers get maximum value from INTRA AI. Onboard new users, handle support escalations, and collect feedback.',
    skills: ['Communication', 'SaaS', 'Customer Support', 'Hindi/English'],
  },
];

const perks = [
  '100% remote — work from anywhere in India',
  'Competitive salary + performance bonus',
  'Health insurance (self + family)',
  'Annual learning & development budget ₹50,000',
  'Latest MacBook / equipment provided',
  'Flexible working hours',
  '24 days paid leave per year',
  'Equity options for senior roles',
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Join our team</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            We're a small, remote-first team building AI tools for Indian businesses. If that excites you, we'd love to hear from you.
          </p>
        </div>

        {/* Open roles */}
        <h2 className="text-xl font-bold text-gray-900 mb-5">Open positions</h2>
        <div className="space-y-4 mb-14">
          {openRoles.map(role => (
            <div key={role.title} className="card p-6 hover:border-primary-200 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{role.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{role.type}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{role.location}</span>
                    <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" />{role.salary}</span>
                  </div>
                </div>
                <a href={`mailto:careers@intra-ai.com?subject=Application: ${role.title}`}
                  className="btn-primary text-sm px-5 py-2 whitespace-nowrap">
                  Apply now
                </a>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">{role.desc}</p>
              <div className="flex flex-wrap gap-2">
                {role.skills.map(s => <span key={s} className="badge bg-gray-100 text-gray-600 text-xs">{s}</span>)}
              </div>
            </div>
          ))}
        </div>

        {/* Perks */}
        <div className="card p-7 bg-gray-50 mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Why work at INTRA AI</h2>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {perks.map(p => (
              <div key={p} className="flex items-center gap-2.5 text-sm text-gray-700">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-green-600 text-xs">✓</span>
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Spontaneous */}
        <div className="text-center card p-7">
          <h3 className="font-bold text-gray-900 mb-2">Don't see a role that fits?</h3>
          <p className="text-sm text-gray-500 mb-4">Send us your CV anyway. We hire great people even when we don't have a role open.</p>
          <a href="mailto:careers@intra-ai.com?subject=Spontaneous Application"
            className="btn-secondary inline-flex px-6 py-2.5">
            Send open application
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
