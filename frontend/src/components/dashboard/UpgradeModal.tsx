'use client';
import { useEffect, useState } from 'react';
import { X, Check, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { formatCurrency, getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

declare global { interface Window { Razorpay: any; } }

interface Props {
  open: boolean;
  onClose: () => void;
  feature?: string; // which feature triggered the modal
}

export default function UpgradeModal({ open, onClose, feature }: Props) {
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [yearly, setYearly] = useState(false);
  const [paying, setPaying] = useState<string | null>(null);

  useEffect(() => {
    if (open) api.get('/plans').then(r => setPlans(r.data.plans || []));
  }, [open]);

  const loadRazorpay = () => new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    document.body.appendChild(s);
  });

  const purchase = async (plan: any) => {
    if (plan.slug === 'free' || plan.slug === user?.plan_slug) return;
    await loadRazorpay();
    setPaying(plan.id);
    try {
      const { data } = await api.post('/payments/create-order', { planId: plan.id, billingPeriod: yearly ? 'yearly' : 'monthly' });
      
      // Admin email bypass — plan activated without payment
      if (data.adminBypass) {
        toast.success(`🎉 ${data.message}`);
        await refreshUser();
        onClose();
        return;
      }

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'INTRA AI',
        description: `${data.planName} Plan`,
        order_id: data.orderId,
        handler: async (response: any) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id,
              billingPeriod: yearly ? 'yearly' : 'monthly',
            });
            toast.success(`🎉 Upgraded to ${data.planName}!`);
            await refreshUser();
            onClose();
          } catch { toast.error('Payment verification failed. Contact support.'); }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#2563EB' },
      });
      rzp.open();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setPaying(null); }
  };

  if (!open) return null;

  const featureMessages: Record<string, string> = {
    url_scraping: '🌐 URL scraping is a Pro feature',
    db_connect: '🗄️ Database connection is a Business feature',
    analytics: '📊 Full analytics is a Pro feature',
    branding: '🎨 Remove branding is a Pro feature',
    api: '🔑 API access is a Business feature',
    bots: '🤖 You\'ve reached your bot limit',
    messages: '💬 You\'ve reached your monthly message limit',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary-600" /> Upgrade Your Plan
            </h2>
            {feature && featureMessages[feature] && (
              <p className="text-sm text-primary-600 mt-0.5">{featureMessages[feature]}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle */}
        <div className="px-6 pt-5 flex items-center gap-3">
          <span className={`text-sm font-medium ${!yearly ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
          <button onClick={() => setYearly(!yearly)}
            className={`relative w-10 h-5 rounded-full transition-colors ${yearly ? 'bg-primary-600' : 'bg-gray-200'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${yearly ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-sm font-medium ${yearly ? 'text-gray-900' : 'text-gray-400'}`}>
            Yearly <span className="badge bg-green-100 text-green-700 ml-1">Save 17%</span>
          </span>
        </div>

        {/* Plans */}
        <div className="grid sm:grid-cols-3 gap-4 p-6">
          {plans.map(plan => {
            const isCurrent = user?.plan_slug === plan.slug;
            const price = yearly ? plan.price_yearly : plan.price_monthly;
            const features = Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features || '[]');
            return (
              <div key={plan.id} className={`relative rounded-2xl border p-5 flex flex-col transition-all ${
                plan.is_featured ? 'border-primary-400 shadow-lg shadow-primary-100 scale-[1.02]' :
                isCurrent ? 'border-green-300 bg-green-50/30' : 'border-gray-100'
              }`}>
                {plan.is_featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-3">
                    <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">Current</span>
                  </div>
                )}
                <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{plan.description}</p>
                <div className="text-2xl font-extrabold text-gray-900 mb-4">
                  {price === 0 ? 'Free' : formatCurrency(price)}
                  {price > 0 && <span className="text-xs font-normal text-gray-400">/{yearly ? 'yr' : 'mo'}</span>}
                </div>
                <ul className="space-y-2 flex-1 mb-4">
                  {features.map((f: string) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                      <Check className="w-3.5 h-3.5 text-primary-600 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => purchase(plan)}
                  disabled={isCurrent || paying === plan.id || plan.slug === 'free'}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    isCurrent || plan.slug === 'free'
                      ? 'bg-gray-100 text-gray-400 cursor-default'
                      : plan.is_featured
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'border border-primary-600 text-primary-700 hover:bg-primary-50'
                  }`}>
                  {paying === plan.id
                    ? <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    : isCurrent ? '✓ Current plan'
                    : plan.slug === 'free' ? 'Free plan'
                    : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs text-gray-400 pb-5">Secure payments via Razorpay · Cancel anytime</p>
      </div>
    </div>
  );
}
