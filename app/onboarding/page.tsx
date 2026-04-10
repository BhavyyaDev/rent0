'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ShoppingBag, ArrowRight, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { completeOnboarding } from '@/app/actions/user';
import { cn } from '@/lib/utils';

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<'renter' | 'lender' | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 sm:p-10">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold mb-6">
            Welcome to RentO
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
             How do you want to use RentO?
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
            Pick a role to get started. You can always switch between them later from your profile.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          {/* Renter Card */}
          <Card 
            onClick={() => setSelected('renter')}
            className={cn(
              "group relative overflow-hidden cursor-pointer border-2 transition-all duration-300 p-8 sm:p-10 flex flex-col items-center text-center gap-6 rounded-[40px] hover:shadow-2xl active:scale-[0.98]",
              selected === 'renter' 
                ? "border-emerald-500 bg-emerald-50/10 shadow-xl" 
                : "border-slate-100 bg-white hover:border-slate-200"
            )}
          >
            <div className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
              selected === 'renter' ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-600 px-1"
            )}>
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">I want to Rent</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Find professional gear, book instantly, and create amazing projects.
              </p>
            </div>
            {selected === 'renter' && (
              <div className="absolute top-6 right-6 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white animate-in zoom-in duration-300">
                <Check className="w-5 h-5" />
              </div>
            )}
          </Card>

          {/* Lender Card */}
          <Card 
            onClick={() => setSelected('lender')}
            className={cn(
              "group relative overflow-hidden cursor-pointer border-2 transition-all duration-300 p-8 sm:p-10 flex flex-col items-center text-center gap-6 rounded-[40px] hover:shadow-2xl active:scale-[0.98]",
              selected === 'lender' 
                ? "border-emerald-500 bg-emerald-50/10 shadow-xl" 
                : "border-slate-100 bg-white hover:border-slate-200"
            )}
          >
            <div className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3",
              selected === 'lender' ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-600"
            )}>
              <Camera className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">I want to List</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Turn your equipment into income. List your gear and start earning today.
              </p>
            </div>
            {selected === 'lender' && (
              <div className="absolute top-6 right-6 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white animate-in zoom-in duration-300">
                <Check className="w-5 h-5" />
              </div>
            )}
          </Card>
        </div>

        {error && (
          <div className="text-red-500 text-center font-bold mb-6 animate-shake">
            {error}
          </div>
        )}

        <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <Button
            size="lg"
            disabled={!selected || isPending}
            onClick={handleComplete}
            className="rounded-full h-16 px-12 text-lg font-extrabold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 disabled:translate-y-0 hover:-translate-y-1 group"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Setting up your account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
