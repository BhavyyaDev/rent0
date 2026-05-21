'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  CalendarDays, Shield, Lock, Loader2, Package,
  CheckCircle2, AlertCircle, ChevronRight,
} from 'lucide-react';
import { getCheckoutData, createCheckoutSession, confirmPayment } from '@/app/actions/request';

type CheckoutData = {
  requestId: string;
  item: { title: string; category: string; imageUrl: string | null; pricePerDay: number };
  deposit: number;
  lender: { name: string };
  startDate: string;
  endDate: string;
  days: number;
  totalPrice: number;
};

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function LoadingView({ label = 'Loading checkout...' }: { label?: string }) {
  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-[#1a1a1a] animate-spin" />
        <p className="text-lg font-bold text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId');
  const status = searchParams.get('status');

  const [data, setData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) {
      router.push('/dashboard');
      return;
    }

    if (status === 'success') {
      setConfirming(true);
      confirmPayment(requestId)
        .then(() => router.push('/dashboard'))
        .catch(() => router.push('/dashboard'));
      return;
    }

    getCheckoutData(requestId).then((result) => {
      if ('error' in result && result.error) {
        setError(result.error as string);
      } else if ('success' in result && result.success) {
        setData(result as unknown as CheckoutData);
      }
      setLoading(false);
    });
  }, [requestId, status]);

  async function handlePayNow() {
    if (!requestId || paying) return;
    setPaying(true);
    const result = await createCheckoutSession(requestId);
    if ('url' in result && result.url) {
      window.location.href = result.url;
    } else {
      setError('error' in result ? (result.error as string) : 'Failed to initiate payment');
      setPaying(false);
    }
  }

  if (loading || confirming) {
    return <LoadingView label={confirming ? 'Confirming your payment...' : 'Loading checkout...'} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] relative overflow-x-hidden flex items-center justify-center p-8">
        <div className="orb absolute w-[500px] h-[500px] bg-[#d4f07a] top-[-100px] right-[-100px]" />
        <div className="glass-panel rounded-3xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-black text-[#1a1a1a] mb-2">Cannot Proceed</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="inline-block bg-[#d4f07a] text-[#1a1a1a] font-bold px-8 py-3 rounded-full hover:bg-[#c8e86e] transition-all hover:scale-105 active:scale-95"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#f9f9f9] relative overflow-x-hidden">
      {/* Background orbs */}
      <div className="orb absolute w-[500px] h-[500px] bg-[#d4f07a] top-[-100px] right-[-100px]" />
      <div className="orb absolute w-[350px] h-[350px] bg-pink-200 bottom-[20%] left-[-80px]" />

      {/* Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-white/30 shadow-sm">
        <nav className="flex justify-between items-center h-16 px-8 max-w-[1440px] mx-auto">
          <Link href="/" className="text-2xl font-black tracking-tighter text-[#d4f07a]">
            RentO
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/explore" className="text-sm font-semibold text-gray-500 hover:text-[#1a1a1a] transition-colors">
              Explore
            </Link>
            <Link href="/dashboard" className="text-sm font-semibold text-gray-500 hover:text-[#1a1a1a] transition-colors">
              Dashboard
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-28 pb-20 px-8 max-w-[1200px] mx-auto">
        {/* Breadcrumb */}
        <nav className="glass-panel w-fit px-4 py-1.5 rounded-full mb-10">
          <ol className="flex items-center gap-1 text-xs font-semibold text-gray-500">
            <li>
              <Link href="/" className="hover:text-[#526600] transition-colors">Home</Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li>
              <Link href="/dashboard" className="hover:text-[#526600] transition-colors">Dashboard</Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li className="text-[#526600] font-bold">Checkout</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* ── Left: Order Summary ─────────────────────────────────── */}
          <div className="md:col-span-7 space-y-5">
            <div className="glass-panel rounded-3xl p-8">
              <h2 className="text-2xl font-black text-[#1a1a1a] mb-7">Order Summary</h2>

              {/* Item card */}
              <div className="flex gap-5 mb-7">
                <div className="w-28 h-28 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                  {data.item.imageUrl ? (
                    <Image
                      src={data.item.imageUrl}
                      alt={data.item.title}
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block bg-[#d4f07a] text-[#3d4d00] text-xs font-bold px-3 py-1 rounded-full mb-2 capitalize">
                    {data.item.category}
                  </span>
                  <h3 className="text-xl font-black text-[#1a1a1a] leading-tight">{data.item.title}</h3>
                  <p className="text-sm text-gray-400 mt-1.5">
                    Listed by{' '}
                    <span className="font-semibold text-[#1a1c1c]">{data.lender.name}</span>
                  </p>
                </div>
              </div>

              <div className="h-px bg-gray-100 mb-7" />

              {/* Rental dates */}
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#d4f07a]/20 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-5 h-5 text-[#526600]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Rental Period</p>
                  <p className="text-sm font-bold text-[#1a1c1c]">
                    {fmtDate(data.startDate)} → {fmtDate(data.endDate)}
                  </p>
                </div>
                <span className="bg-[#d4f07a]/30 text-[#3d4d00] text-xs font-black px-3 py-1.5 rounded-full whitespace-nowrap">
                  {data.days} {data.days === 1 ? 'day' : 'days'}
                </span>
              </div>

              <div className="h-px bg-gray-100 my-7" />

              {/* Price breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">
                    {fmt(data.item.pricePerDay)} × {data.days} {data.days === 1 ? 'day' : 'days'}
                  </span>
                  <span className="font-semibold text-[#1a1c1c]">{fmt(data.totalPrice)}</span>
                </div>
                {data.deposit > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Refundable deposit</span>
                    <span className="font-semibold text-[#1a1c1c]">{fmt(data.deposit)}</span>
                  </div>
                )}
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-[#1a1a1a]">Total</span>
                  <span className="text-2xl font-black text-[#1a1a1a]">{fmt(data.totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Protection badge */}
            <div className="glass-panel rounded-3xl p-6 flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-[#d4f07a]/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-[#526600]" />
              </div>
              <div>
                <p className="font-bold text-[#1a1a1a] text-sm">RentO Lifecycle Protection</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Your rental is covered from booking to return. Secured escrow ensures funds are held safely until item handover.
                </p>
              </div>
            </div>
          </div>

          {/* ── Right: Payment ──────────────────────────────────────── */}
          <div className="md:col-span-5">
            <div className="glass-panel rounded-3xl p-8 sticky top-24 space-y-7">
              <div>
                <h2 className="text-2xl font-black text-[#1a1a1a] mb-1">Complete Your Booking</h2>
                <p className="text-sm text-gray-500">You're one step away from securing your rental.</p>
              </div>

              {/* Amount highlight */}
              <div className="bg-[#d4f07a]/15 border border-[#d4f07a]/40 rounded-2xl p-5">
                <p className="text-xs font-bold text-[#526600] uppercase tracking-wider mb-1.5">Total Due Today</p>
                <p className="text-4xl font-black text-[#1a1a1a]">{fmt(data.totalPrice)}</p>
                {data.deposit > 0 && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    Includes {fmt(data.deposit)} refundable deposit
                  </p>
                )}
              </div>

              {/* Security indicators */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-gray-500">
                  <Lock className="w-3.5 h-3.5 text-[#526600] flex-shrink-0" />
                  <span>Secure payment via Stripe</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-500">
                  <Shield className="w-3.5 h-3.5 text-[#526600] flex-shrink-0" />
                  <span>Funds held in escrow until handover</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#526600] flex-shrink-0" />
                  <span>Full refund if request is cancelled</span>
                </div>
              </div>

              {/* Pay Now */}
              <button
                onClick={handlePayNow}
                disabled={paying}
                className="w-full bg-[#d4f07a] text-[#1a1a1a] font-black text-base py-5 rounded-full hover:bg-[#c8e86e] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-lg shadow-[#d4f07a]/30"
              >
                {paying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redirecting to Stripe...
                  </>
                ) : (
                  <>Pay Now — {fmt(data.totalPrice)}</>
                )}
              </button>

              <Link
                href="/dashboard"
                className="block text-center text-sm text-gray-400 hover:text-[#1a1a1a] transition-colors"
              >
                Cancel and go back
              </Link>

              <p className="text-center text-[10px] text-gray-300 leading-relaxed">
                Secured by Stripe · 256-bit encrypted · Protected by RentO
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-16 mt-8">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="text-2xl font-black tracking-tighter text-[#d4f07a] mb-4">RentO</div>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                The world's premium marketplace for professional gear sharing.
              </p>
            </div>
            <div className="grid grid-cols-3 col-span-3 gap-8">
              {[
                { title: 'Platform', links: ['About Us', 'Safety First', 'Careers'] },
                { title: 'Legal', links: ['Terms of Service', 'Privacy Policy', 'Refund Policy'] },
                { title: 'Support', links: ['Help Center', 'Safety Guide', 'Contact Us'] },
              ].map((col) => (
                <div key={col.title} className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-[#d4f07a]">{col.title}</h5>
                  <ul className="space-y-2">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a href="#" className="text-sm text-gray-400 hover:text-[#d4f07a] transition-colors">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">© 2026 RentO Marketplace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingView />}>
      <CheckoutPageContent />
    </Suspense>
  );
}
