import { Star, Quote } from 'lucide-react';

const testimonials = [
  { name: 'Priya Sharma', role: 'Founder, TechStartup', avatar: '/images/avatars/avatar1.png', rating: 5,
    text: 'INTRA AI saved us weeks of dev work. We had a fully trained support chatbot live on our site in one afternoon.' },
  { name: 'Rahul Mehta', role: 'E-commerce Manager', avatar: '/images/avatars/avatar2.png', rating: 5,
    text: 'The URL scraping feature is incredible. Our bot instantly knows everything from our FAQ and product pages.' },
  { name: 'Ananya Iyer', role: 'HR Director', avatar: '/images/avatars/avatar3.png', rating: 5,
    text: 'We trained it on our employee handbook and now it answers HR questions 24/7. Support tickets dropped 60%.' },
  { name: 'Vikram Patel', role: 'SaaS Founder', avatar: '/images/avatars/avatar4.png', rating: 5,
    text: 'The customization is unmatched. Our chatbot looks native to our product. Customers can\'t tell it\'s a third-party tool.' },
  { name: 'Shreya Kapoor', role: 'Marketing Lead', avatar: '/images/avatars/avatar5.png', rating: 5,
    text: 'Razorpay integration works flawlessly and the plans are very affordable for Indian businesses.' },
  { name: 'Arjun Nair', role: 'CTO, FinTech', avatar: '/images/avatars/avatar6.png', rating: 5,
    text: 'Database connection feature is a game-changer. Our bot pulls live data and answers account-specific questions.' },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="section-title">Loved by builders everywhere</h2>
          <p className="section-subtitle mx-auto">Join thousands of businesses already using INTRA AI.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div key={t.name} className="card-hover p-6">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <Quote className="w-6 h-6 text-primary-200 mb-2" />
              <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
