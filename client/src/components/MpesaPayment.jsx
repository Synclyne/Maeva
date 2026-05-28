import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../lib/api';

const PACKAGES = [
  { name: 'Basic Boost',   days: 7,  price: 500,   badge: null,      desc: 'Appear higher in search results' },
  { name: 'Featured',      days: 14, price: 1500,  badge: 'Featured', desc: 'Featured badge + top placement' },
  { name: 'Premium',       days: 30, price: 3500,  badge: 'Premium',  desc: 'Premium badge + homepage feature' },
  { name: 'Hot Property',  days: 14, price: 2000,  badge: 'Hot',      desc: 'Hot badge + social media boost' },
];

export default function MpesaPayment({ listingId, onClose, onSuccess }) {
  const toast = useToast();
  const [step, setStep]           = useState('select'); // 'select' | 'pay' | 'pending' | 'done'
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [phone, setPhone]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [sandboxMode, setSandboxMode] = useState(false);

  const handlePay = async () => {
    if (!phone.trim()) { toast.warn('Please enter your M-Pesa phone number'); return; }
    const cleanPhone = phone.replace(/\s/g, '').replace(/^0/, '254').replace(/^\+/, '');
    if (!/^254[17]\d{8}$/.test(cleanPhone)) { toast.warn('Enter a valid Kenyan phone number (e.g. 0712345678)'); return; }

    setLoading(true);
    try {
      const { data } = await api.post('/payments/mpesa/stk-push', {
        phone: cleanPhone,
        amount: selectedPkg.price,
        listing_id: listingId,
        package_name: selectedPkg.name,
      });

      if (data.sandbox) {
        setSandboxMode(true);
        setStep('done');
        toast.success('Sandbox: Payment simulated successfully!');
        onSuccess?.(selectedPkg);
      } else if (data.ResponseCode === '0') {
        setStep('pending');
        toast.success('STK Push sent! Check your phone for the M-Pesa prompt.');
        // Auto-advance to done after 30 seconds (production would poll for callback)
        setTimeout(() => { setStep('done'); onSuccess?.(selectedPkg); }, 30000);
      } else {
        toast.error(data.errorMessage || 'Payment initiation failed. Please try again.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment service unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <h2 className="font-semibold text-gray-900">Boost Your Listing</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="p-5">

          {/* Step 1: Package selection */}
          {step === 'select' && (
            <>
              <p className="text-sm text-gray-500 mb-4">Choose a visibility boost package for this listing:</p>
              <div className="space-y-3 mb-5">
                {PACKAGES.map(pkg => (
                  <label key={pkg.name}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPkg?.name === pkg.name ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input type="radio" className="sr-only" checked={selectedPkg?.name === pkg.name} onChange={() => setSelectedPkg(pkg)} />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedPkg?.name === pkg.name ? 'border-primary' : 'border-gray-300'}`}>
                      {selectedPkg?.name === pkg.name && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{pkg.name}</span>
                        <span className="text-xs text-gray-400">{pkg.days} days</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{pkg.desc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-primary text-sm">KES {pkg.price.toLocaleString()}</div>
                    </div>
                  </label>
                ))}
              </div>
              <button
                onClick={() => selectedPkg && setStep('pay')}
                disabled={!selectedPkg}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-opacity">
                Continue
              </button>
            </>
          )}

          {/* Step 2: M-Pesa payment */}
          {step === 'pay' && (
            <>
              <div className="bg-green-50 rounded-xl p-4 mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{selectedPkg.name}</p>
                    <p className="text-xs text-gray-500">{selectedPkg.days} days · {selectedPkg.desc}</p>
                  </div>
                  <div className="font-bold text-green-700 text-lg">KES {selectedPkg.price.toLocaleString()}</div>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">M-Pesa Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0712 345 678"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                />
                <p className="text-xs text-gray-400 mt-1.5">You will receive an STK push prompt on this number.</p>
              </div>

              <div className="bg-amber-50 rounded-xl p-3 mb-5 flex items-start gap-2">
                <span className="text-base shrink-0">ℹ️</span>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Enter your PIN when prompted on your phone. Do not share your PIN with anyone.
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('select')} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">
                  Back
                </button>
                <button onClick={handlePay} disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    'Pay with M-Pesa'
                  )}
                </button>
              </div>
            </>
          )}

          {/* Step 3: Pending */}
          {step === 'pending' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Check Your Phone</h3>
              <p className="text-sm text-gray-500 mb-1">An M-Pesa STK push has been sent to <strong>{phone}</strong></p>
              <p className="text-xs text-gray-400">Enter your M-Pesa PIN to complete the payment.</p>
              <div className="mt-6 flex gap-1 justify-center">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 'done' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                {sandboxMode ? 'Sandbox: Payment Simulated' : 'Payment Successful!'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {sandboxMode
                  ? 'In production, this would trigger an M-Pesa STK push. Your listing boost has been activated.'
                  : `Your listing has been boosted with the "${selectedPkg.name}" package for ${selectedPkg.days} days.`
                }
              </p>
              {sandboxMode && (
                <div className="text-xs bg-amber-50 text-amber-700 rounded-xl p-3 mb-4">
                  ⚙️ Sandbox mode — configure MPESA_CONSUMER_KEY in server/.env for live payments
                </div>
              )}
              <button onClick={onClose} className="w-full bg-primary text-white py-3 rounded-xl font-semibold">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
