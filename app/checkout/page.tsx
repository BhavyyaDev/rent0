import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, CreditCard, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { confirmPayment, getRequestDetails } from '@/app/actions/request';
import Link from 'next/link';

export default function CheckoutPage({ searchParams }: { searchParams: Promise<{ id: string }> }) {
  const router = useRouter();
  const params = use(searchParams);
  const requestId = params.id;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [details, setDetails] = useState<{ title: string, totalPrice: number, days: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      if (!requestId) return;
      const res = await getRequestDetails(requestId);
      if (res.success) {
        setDetails({ title: res.title!, totalPrice: res.totalPrice!, days: res.days! });
      } else {
        setError(res.error || 'Failed to load project details');
      }
      setIsLoading(false);
    }
    fetchDetails();
  }, [requestId]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');
    
    const res = await confirmPayment(requestId);
    
    if (res?.error) {
       setError(res.error);
       setIsProcessing(false);
    } else {
       setIsSuccess(true);
       setTimeout(() => {
         router.push('/dashboard');
       }, 3000);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8 shadow-sm border border-emerald-100">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Payment Successful!</h1>
        <p className="text-xl text-slate-500 font-bold max-w-md mx-auto mb-12">
          Your transaction for <span className="text-slate-900">"{details?.title}"</span> has been confirmed.
        </p>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <Button 
            onClick={() => router.push('/dashboard')}
            className="w-full h-15 rounded-full bg-slate-900 hover:bg-black text-white font-black text-lg shadow-lg active:scale-95 transition-all"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-slate-900 animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Initializing Secure Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <span className="font-black text-slate-950 uppercase tracking-widest text-xs">Secure Checkout</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Left: Payment Form Mock */}
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-[32px] font-black text-slate-950 tracking-tighter mb-2">Complete Payment</h2>
            <p className="text-slate-500 font-bold text-lg">Securely finalize your rental project.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <label className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-slate-900 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute top-2 right-2 w-2 h-2 bg-slate-900 rounded-full" />
                  <CreditCard className="w-8 h-8 text-slate-900" />
                  <span className="font-black text-slate-900">Card</span>
                </div>
                <div className="border-2 border-slate-100 rounded-2xl p-4 flex flex-col gap-3 grayscale opacity-40 cursor-not-allowed">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                  <span className="font-bold text-slate-400">Other</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Card Information</span>
                <div className="h-14 w-full bg-slate-50 rounded-xl border border-slate-200 flex items-center px-4">
                  <span className="text-slate-400 font-bold">4242 4242 4242 4242</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-14 w-full bg-slate-50 rounded-xl border border-slate-200 flex items-center px-4">
                   <span className="text-slate-400 font-bold italic">MM / YY</span>
                </div>
                <div className="h-14 w-full bg-slate-50 rounded-xl border border-slate-200 flex items-center px-4">
                   <span className="text-slate-400 font-bold italic">CVC</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 font-bold text-sm">
                {error}
              </div>
            )}

            <Button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full h-16 rounded-full bg-slate-950 hover:bg-black text-white font-black text-xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" /> Processing...
                </span>
              ) : `Pay ₹${details?.totalPrice.toLocaleString()}`}
            </Button>

            <div className="flex items-center justify-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Secured by RentO Pay</span>
            </div>
          </div>
        </div>

        {/* Right: Summary Mock */}
        <div className="flex flex-col gap-8">
          <div className="bg-slate-900 rounded-[32px] p-10 text-white flex flex-col gap-10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
             
             <div>
               <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.2em] mb-4">Project Summary</h3>
               <div className="flex flex-col gap-1">
                 <span className="text-2xl font-black tracking-tight line-clamp-2">{details?.title || "Rental Request"}</span>
                 <span className="text-white/60 font-bold">Standard Professional Rental</span>
               </div>
             </div>

             <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center text-white/60 font-bold">
                  <span>Base Duration</span>
                  <span className="text-white">{details?.days || 0} Days</span>
                </div>
                <div className="flex justify-between items-center text-white/60 font-bold">
                  <span>Service Fee</span>
                  <span className="text-white">Included</span>
                </div>
             </div>

             <div className="pt-10 border-t border-white/10 flex flex-col gap-1">
                <span className="text-xs font-black text-white/30 uppercase tracking-[0.3em]">Amount Due</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black">₹{details?.totalPrice.toLocaleString()}</span>
                  <span className="text-white/40 font-bold">Total</span>
                </div>
                <p className="mt-6 text-[11px] font-bold text-white/40 leading-relaxed uppercase tracking-wider">
                  Payment is held in secure custody until the return phase is finalized.
                </p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
