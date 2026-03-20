import { UserPlus, Cpu, Palette, Share2 } from 'lucide-react';

const steps = [
  {
    step: '01', icon: UserPlus, title: 'Create your account',
    desc: 'Sign up for free — no credit card needed. Get instant access to the dashboard.',
    color: 'bg-blue-600',
  },
  {
    step: '02', icon: Cpu, title: 'Train your chatbot',
    desc: 'Upload PDFs, add your website URL, or connect your database. We process everything automatically.',
    color: 'bg-indigo-600',
  },
  {
    step: '03', icon: Palette, title: 'Customize the look',
    desc: 'Match your brand perfectly — colors, fonts, bot name, welcome message, and more.',
    color: 'bg-violet-600',
  },
  {
    step: '04', icon: Share2, title: 'Embed & go live',
    desc: 'Copy one line of embed code and paste it on your website. Your bot is live instantly.',
    color: 'bg-purple-600',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            🚀 Simple process
          </div>
          <h2 className="section-title">Up and running in 4 steps</h2>
          <p className="section-subtitle mx-auto">
            No technical knowledge needed. Go from zero to a fully functional AI chatbot in under 10 minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-12 left-1/4 right-1/4 h-px bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200" style={{ left: '12.5%', right: '12.5%' }} />

          {steps.map((s, i) => (
            <div key={s.step} className="relative text-center group">
              <div className="relative inline-block mb-5">
                <div className={`w-20 h-20 ${s.color} rounded-2xl flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition-transform mx-auto`}>
                  <span className="text-white text-xs font-bold opacity-70 mb-0.5">{s.step}</span>
                  <s.icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
