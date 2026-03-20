import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'INTRA AI — Build AI Chatbots Effortlessly',
  description: 'Create, train, and deploy intelligent AI chatbots for your business in minutes. No coding required.',
  keywords: 'AI chatbot, chatbot builder, customer support AI, Gemini AI, chatbot platform',
  openGraph: {
    title: 'INTRA AI — Build AI Chatbots Effortlessly',
    description: 'Create, train, and deploy intelligent AI chatbots in minutes.',
    type: 'website',
  },
  icon:'/favicon.svg'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '12px', fontSize: '14px', fontFamily: 'Inter, sans-serif' },
              success: { iconTheme: { primary: '#2563eb', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
