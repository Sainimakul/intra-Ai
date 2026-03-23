import Navbar from '@/components/home/Navbar';
import { Footer } from '@/components/home/CTASection';
import Link from 'next/link';

const posts = [
  {
    slug: 'getting-started-with-ai-chatbots',
    title: 'Getting Started with AI Chatbots for Your Business',
    excerpt: 'A complete beginner\'s guide to building your first AI chatbot — from choosing the right use case to deploying on your website.',
    category: 'Guide',
    date: 'March 15, 2026',
    readTime: '6 min read',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    slug: 'train-chatbot-on-your-docs',
    title: 'How to Train Your Chatbot on Your Own Documents',
    excerpt: 'Step-by-step walkthrough of uploading PDFs, scraping your website, and connecting a database to power your chatbot\'s knowledge base.',
    category: 'Tutorial',
    date: 'March 10, 2026',
    readTime: '8 min read',
    color: 'bg-green-50 text-green-600',
  },
  {
    slug: 'chatbot-vs-live-chat',
    title: 'AI Chatbot vs Live Chat: Which is Right for You?',
    excerpt: 'An honest comparison of AI chatbots and live chat support. When to use each, the cost difference, and how to combine them.',
    category: 'Analysis',
    date: 'March 5, 2026',
    readTime: '5 min read',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    slug: 'reduce-support-tickets',
    title: '5 Ways AI Chatbots Reduce Support Tickets by 60%',
    excerpt: 'Real strategies our customers use to deflect common queries, answer FAQs instantly, and free up their support team.',
    category: 'Strategy',
    date: 'February 28, 2026',
    readTime: '7 min read',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    slug: 'gemini-vs-gpt-chatbots',
    title: 'Google Gemini vs GPT-4 for Customer Support Chatbots',
    excerpt: 'We tested both models extensively. Here\'s what we found about accuracy, speed, cost, and suitability for business use cases.',
    category: 'Comparison',
    date: 'February 20, 2026',
    readTime: '10 min read',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    slug: 'embed-chatbot-website',
    title: 'How to Embed an AI Chatbot on Any Website in 2 Minutes',
    excerpt: 'Whether you\'re on WordPress, Webflow, Shopify, or a custom site — here\'s exactly how to add INTRA AI with one line of code.',
    category: 'Tutorial',
    date: 'February 14, 2026',
    readTime: '4 min read',
    color: 'bg-teal-50 text-teal-600',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Blog</h1>
          <p className="text-gray-500 text-lg">Guides, tutorials, and insights on AI chatbots for business.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <article key={post.slug} className="card-hover p-5 flex flex-col">
              <div className={`badge ${post.color} text-xs mb-3 w-fit`}>{post.category}</div>
              <h2 className="font-bold text-gray-900 mb-2 leading-snug flex-1">{post.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs text-gray-400">
                <span>{post.date}</span>
                <span>{post.readTime}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 card p-6 bg-primary-50 border-primary-200 text-center">
          <h3 className="font-bold text-gray-900 mb-2">Want to write for us?</h3>
          <p className="text-sm text-gray-500 mb-4">We're looking for contributors who write about AI, chatbots, and business automation.</p>
          <a href="mailto:hello@intra-ai.com?subject=Guest Post Inquiry" className="btn-primary inline-flex">Get in touch</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
