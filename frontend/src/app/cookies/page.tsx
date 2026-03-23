import Navbar from '@/components/home/Navbar';
import { Footer } from '@/components/home/CTASection';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Cookie Policy</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: March 1, 2026</p>
        <div className="space-y-8 text-gray-600 leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">What are cookies?</h2>
            <p>Cookies are small text files stored on your device by your browser. They help websites remember information about your visit.</p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Cookies we use</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    {['Cookie name', 'Purpose', 'Duration', 'Type'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-gray-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    ['intra_token', 'Keeps you logged in to your dashboard', '7 days', 'Essential'],
                    ['sessionStorage', 'Remembers if welcome modal was shown', 'Session', 'Functional'],
                  ].map(([name, purpose, duration, type]) => (
                    <tr key={name}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-800">{name}</td>
                      <td className="px-4 py-3 text-gray-600">{purpose}</td>
                      <td className="px-4 py-3 text-gray-500">{duration}</td>
                      <td className="px-4 py-3"><span className="badge bg-green-100 text-green-700 text-xs">{type}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Cookies we do NOT use</h2>
            <p>We do not use advertising cookies, cross-site tracking cookies, or third-party analytics cookies (such as Google Analytics). Your browsing behaviour is not tracked for advertising purposes.</p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Chatbot widget cookies</h2>
            <p>The INTRA AI chatbot widget embedded on third-party websites uses sessionStorage (not cookies) to store the current conversation session ID. This data stays in the visitor's browser and is not transmitted to any advertising network.</p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Managing cookies</h2>
            <p>You can clear cookies at any time through your browser settings. Deleting the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">intra_token</code> cookie will log you out of INTRA AI. Most browsers also allow you to block cookies entirely, though this will prevent you from staying logged in.</p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Contact</h2>
            <p>Questions about our cookie use? Email <a href="mailto:privacy@intra-ai.com" className="text-primary-600 hover:underline">privacy@intra-ai.com</a></p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
