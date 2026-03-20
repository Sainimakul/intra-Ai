'use client';
import { useEffect, useState } from 'react';
import { Check, Zap, CreditCard, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate, getErrorMessage } from '@/lib/utils';

declare global { interface Window { Razorpay: any; } }

export default function BillingPage() {
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [yearly, setYearly] = useState(false);
  const [paying, setPaying] = useState<string | null>(null);

  useEffect(() => {
    api.get('/plans').then(r => setPlans(r.data.plans || []));
    api.get('/payments/history').then(r => setPayments(r.data.payments || []));
  }, []);

  const loadRazorpay = () => new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    document.body.appendChild(s);
  });

  const purchase = async (plan: any) => {
    if (plan.slug === 'free') return toast.error('You already have the free plan');
    await loadRazorpay();
    setPaying(plan.id);
    try {
      const { data } = await api.post('/payments/create-order', { planId: plan.id, billingPeriod: yearly ? 'yearly' : 'monthly' });
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
            api.get('/payments/history').then(r => setPayments(r.data.payments || []));
          } catch (err) { toast.error('Payment verification failed. Contact support.'); }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#2563EB' },
      });
      rzp.open();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setPaying(null); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Plans</h1>
          <p className="text-gray-500 text-sm mt-1">
            Current plan: <span className="font-semibold text-primary-600">{user?.plan_name || 'Free'}</span>
          </p>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-3 mb-6">
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
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {plans.map(plan => {
          const isCurrent = user?.plan_slug === plan.slug;
          const price = yearly ? plan.price_yearly : plan.price_monthly;
          const features = Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features || '[]');
          return (
            <div key={plan.id} className={`card p-5 flex flex-col relative ${plan.is_featured ? 'border-primary-300 shadow-md' : ''} ${isCurrent ? 'border-green-300 bg-green-50/30' : ''}`}>
              {plan.is_featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">Popular</span>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">Current</span>
                </div>
              )}
              <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{plan.description}</p>
              <div className="text-3xl font-extrabold text-gray-900 mb-4">
                {price === 0 ? 'Free' : formatCurrency(price)}
                {price > 0 && <span className="text-sm font-normal text-gray-400">/{yearly ? 'yr' : 'mo'}</span>}
              </div>
              <ul className="space-y-2 flex-1 mb-5">
                {features.map((f: string) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => purchase(plan)} disabled={isCurrent || paying === plan.id}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all ${
                  isCurrent ? 'bg-green-100 text-green-700 cursor-default' :
                  plan.is_featured ? 'btn-primary' : 'btn-secondary'
                }`}>
                {paying === plan.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> :
                  isCurrent ? '✓ Current plan' : price === 0 ? 'Downgrade' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment history */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> Payment History
        </h3>
        {payments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No payments yet.</p>
        ) : (
          <div className="space-y-2">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="text-sm font-medium text-gray-900">{p.plan_name} Plan</div>
                  <div className="text-xs text-gray-400">{formatDate(p.created_at)} · {p.billing_period}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatCurrency(p.amount, p.currency)}</div>
                  <span className={`badge text-xs ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
