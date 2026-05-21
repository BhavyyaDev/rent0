'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { ShoppingBag, Camera, Check, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { completeOnboarding, getAccountData } from '@/app/actions/user';

const RENTER_BENEFITS = [
  'Browse thousands of items',
  'Secure escrow payments',
  'Lifecycle protection',
];

const LENDER_BENEFITS = [
  'Earn passive income',
  'You control pricing',
  'Protected transactions',
];

// Glass styles shared between card states
const GLASS_BASE: React.CSSProperties = {
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
};

const CARD_DEFAULT: React.CSSProperties = {
  ...GLASS_BASE,
  background: 'rgba(255, 255, 255, 0.60)',
  border: '2px solid rgba(255, 255, 255, 0.5)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
};

const CARD_SELECTED: React.CSSProperties = {
  ...GLASS_BASE,
  background: 'rgba(212, 240, 122, 0.15)',
  border: '2px solid #d4f07a',
  boxShadow: '0 10px 40px -10px rgba(212, 240, 122, 0.55)',
};

export default function OnboardingPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [selected, setSelected] = useState<'renter' | 'lender' | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');

  // Auth guard — middleware already blocks unauthenticated, belt-and-suspenders
  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push('/sign-in');
  }, [isLoaded, isSignedIn, router]);

  // Skip onboarding if user already has a role set
  useEffect(() => {
    getAccountData().then((data) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (data && (data as any).role && (data as any).role !== 'onboarding') {
        router.push('/dashboard');
      }
    });
  }, [router]);

  const handleComplete = async () => {
    if (!selected) return;
    setIsPending(true);
    setError('');

    const res = await completeOnboarding(selected);
    if (res.error) {
      setError(res.error);
      setIsPending(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] relative overflow-x-hidden flex flex-col items-center justify-center px-6 py-16">
      {/* Background orbs */}
      <div className="orb w-[600px] h-[600px] bg-[#d4f07a] top-[-200px] right-[-200px]" />
      <div className="orb w-[450px] h-[450px] bg-[#d4f07a]/50 bottom-[-120px] left-[-120px]" />
      <div className="orb w-[280px] h-[280px] bg-pink-200/60 top-[45%] left-[55%]" />

      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">

        {/* Logo */}
        <Link
          href="/"
          className="text-3xl font-black tracking-tighter text-[#d4f07a] mb-14 hover:opacity-80 transition-opacity"
        >
          RentO
        </Link>

        {/* Header */}
        <header className="text-center mb-14">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#d4f07a]/15 border border-[#d4f07a]/30 mb-6">
            <span className="text-[#526600] font-bold text-sm tracking-wide">Welcome to RentO</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1a1a1a] mb-4 tracking-tight">
            How will you use RentO?
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-md mx-auto leading-relaxed">
            You can switch anytime from your dashboard settings.
          </p>
        </header>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">

          {/* ── Renter Card ─────────────────────────────────── */}
          <div
            role="button"
            tabIndex={0}
            aria-pressed={selected === 'renter'}
            onClick={() => setSelected('renter')}
            onKeyDown={(e) => e.key === 'Enter' && setSelected('renter')}
            style={selected === 'renter' ? CARD_SELECTED : CARD_DEFAULT}
            className="relative cursor-pointer rounded-3xl p-8 transition-all duration-300 flex flex-col items-center text-center group hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#d4f07a]/50"
          >
            {/* Checkmark badge */}
            {selected === 'renter' && (
              <div className="absolute top-5 right-5 w-8 h-8 bg-[#d4f07a] rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                <Check className="w-4 h-4 text-[#1a1a1a]" strokeWidth={3} />
              </div>
            )}

            {/* Icon */}
            <div
              className={[
                'w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500',
                selected === 'renter'
                  ? 'bg-[#d4f07a] text-[#1a1a1a] scale-110'
                  : 'bg-[#d4f07a]/20 text-[#526600] group-hover:bg-[#d4f07a]/35 group-hover:scale-110',
              ].join(' ')}
            >
              <ShoppingBag className="w-10 h-10" strokeWidth={1.5} />
            </div>

            <h3 className="text-2xl font-black text-[#1a1a1a] mb-2">I want to Rent</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Browse and rent gear from trusted locals in your community.
            </p>

            {/* Benefits list */}
            <ul className="w-full space-y-2 mb-7 text-left">
              {RENTER_BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-sm text-[#1a1c1c]">
                  <CheckCircle2 className="w-4 h-4 text-[#526600] flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>

            {/* Card CTA */}
            <button
              onClick={(e) => { e.stopPropagation(); setSelected('renter'); }}
              className={[
                'w-full py-3 rounded-full font-bold text-sm transition-all duration-200 active:scale-95',
                selected === 'renter'
                  ? 'bg-[#d4f07a] text-[#1a1a1a] shadow-md shadow-[#d4f07a]/30 hover:bg-[#c8e86e]'
                  : 'bg-[#d4f07a]/20 text-[#526600] hover:bg-[#d4f07a]/40',
              ].join(' ')}
            >
              Start Renting
            </button>
          </div>

          {/* ── Lender Card ─────────────────────────────────── */}
          <div
            role="button"
            tabIndex={0}
            aria-pressed={selected === 'lender'}
            onClick={() => setSelected('lender')}
            onKeyDown={(e) => e.key === 'Enter' && setSelected('lender')}
            style={selected === 'lender' ? CARD_SELECTED : CARD_DEFAULT}
            className="relative cursor-pointer rounded-3xl p-8 transition-all duration-300 flex flex-col items-center text-center group hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#d4f07a]/50"
          >
            {/* Checkmark badge */}
            {selected === 'lender' && (
              <div className="absolute top-5 right-5 w-8 h-8 bg-[#d4f07a] rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                <Check className="w-4 h-4 text-[#1a1a1a]" strokeWidth={3} />
              </div>
            )}

            {/* Icon */}
            <div
              className={[
                'w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500',
                selected === 'lender'
                  ? 'bg-[#1a1a1a] text-white scale-110'
                  : 'bg-gray-100 text-gray-400 group-hover:bg-[#1a1a1a]/10 group-hover:text-[#1a1a1a] group-hover:scale-110',
              ].join(' ')}
            >
              <Camera className="w-10 h-10" strokeWidth={1.5} />
            </div>

            <h3 className="text-2xl font-black text-[#1a1a1a] mb-2">I want to Lend</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              List your gear and start earning from equipment you already own.
            </p>

            {/* Benefits list */}
            <ul className="w-full space-y-2 mb-7 text-left">
              {LENDER_BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-sm text-[#1a1c1c]">
                  <CheckCircle2 className="w-4 h-4 text-[#526600] flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>

            {/* Card CTA */}
            <button
              onClick={(e) => { e.stopPropagation(); setSelected('lender'); }}
              className={[
                'w-full py-3 rounded-full font-bold text-sm transition-all duration-200 active:scale-95',
                selected === 'lender'
                  ? 'bg-[#1a1a1a] text-white shadow-md hover:bg-[#2a2a2a]'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
              ].join(' ')}
            >
              Start Lending
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-sm font-semibold mb-4 text-center">{error}</p>
        )}

        {/* Continue button */}
        <button
          onClick={handleComplete}
          disabled={!selected || isPending}
          className="w-full max-w-md bg-[#d4f07a] text-[#1a1a1a] font-black text-base py-5 rounded-full transition-all duration-200 hover:bg-[#c8e86e] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-[#d4f07a] flex items-center justify-center gap-2.5 shadow-lg shadow-[#d4f07a]/30"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Setting up your account...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Terms note */}
        <p className="text-xs text-gray-400 mt-5 text-center">
          By continuing you agree to our{' '}
          <a href="#" className="underline decoration-gray-300 hover:text-[#526600] hover:decoration-[#526600] transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="underline decoration-gray-300 hover:text-[#526600] hover:decoration-[#526600] transition-colors">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
