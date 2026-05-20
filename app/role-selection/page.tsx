'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Camera, Check, ArrowRight } from 'lucide-react';

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<'renter' | 'lender' | null>(null);

  const handleComplete = () => {
    if (!selected) return;
    
    // Set a cookie so middleware knows the role is selected
    document.cookie = `rento_role=${selected}; path=/; max-age=${60 * 60 * 24 * 365}`;
    
    // Redirect to home
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 font-sans relative overflow-hidden">
      
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center z-10">
        
        {/* Header Pill */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#f4f7e1] mb-6">
          <span className="text-[#1a1a1a] font-semibold text-sm tracking-wide">Welcome to RentO</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a1a1a] mb-4 tracking-tight text-center">
          How do you want to use RentO?
        </h1>
        <p className="text-[#64748b] text-base md:text-lg max-w-md mx-auto leading-relaxed text-center mb-12">
          Pick a role to get started. You can always switch between them later from your profile.
        </p>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-12">
          
          {/* Renter Card */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelected('renter')}
            onKeyDown={(e) => e.key === 'Enter' && setSelected('renter')}
            className={[
              'relative cursor-pointer rounded-3xl p-10 transition-all duration-300 flex flex-col items-center text-center group hover:-translate-y-2',
              selected === 'renter'
                ? 'border-2 border-[#d4f07a] bg-white shadow-sm'
                : 'border border-gray-100 bg-white hover:border-[#d4f07a]/50 hover:shadow-md'
            ].join(' ')}
          >
            {/* Checkmark */}
            {selected === 'renter' && (
              <div className="absolute top-5 right-5 w-7 h-7 bg-[#d4f07a] rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                <Check className="w-4 h-4 text-[#1a1a1a]" strokeWidth={3} />
              </div>
            )}

            {/* Icon Container */}
            <div className={[
              'w-20 h-20 rounded-[20px] flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110',
              selected === 'renter'
                ? 'bg-[#d4f07a] text-[#1a1a1a]'
                : 'bg-white border border-gray-100 text-[#1a1a1a] group-hover:bg-[#d4f07a]/20'
            ].join(' ')}>
              <ShoppingBag className="w-8 h-8" strokeWidth={1.5} />
            </div>

            <h3 className="text-2xl font-bold text-[#1a1a1a] mb-3">I want to Rent</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-[250px]">
              Find professional gear, book instantly, and create amazing projects.
            </p>
          </div>

          {/* Lender Card */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelected('lender')}
            onKeyDown={(e) => e.key === 'Enter' && setSelected('lender')}
            className={[
              'relative cursor-pointer rounded-3xl p-10 transition-all duration-300 flex flex-col items-center text-center group hover:-translate-y-2',
              selected === 'lender'
                ? 'border-2 border-[#d4f07a] bg-white shadow-sm'
                : 'border border-gray-100 bg-white hover:border-[#d4f07a]/50 hover:shadow-md'
            ].join(' ')}
          >
            {/* Checkmark */}
            {selected === 'lender' && (
              <div className="absolute top-5 right-5 w-7 h-7 bg-[#d4f07a] rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                <Check className="w-4 h-4 text-[#1a1a1a]" strokeWidth={3} />
              </div>
            )}

            {/* Icon Container */}
            <div className={[
              'w-20 h-20 rounded-[20px] flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110',
              selected === 'lender'
                ? 'bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] shadow-sm'
                : 'bg-white border border-gray-100 text-[#94a3b8] group-hover:border-gray-300 group-hover:text-[#1a1a1a]'
            ].join(' ')}>
              <Camera className="w-8 h-8" strokeWidth={1.5} />
            </div>

            <h3 className="text-2xl font-bold text-[#1a1a1a] mb-3">I want to List</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-[250px]">
              Turn your equipment into income. List your gear and start earning today.
            </p>
          </div>

        </div>

        {/* Get Started Button */}
        <button
          onClick={handleComplete}
          disabled={!selected}
          className="bg-[#1a1a1a] text-white font-semibold text-base px-8 py-4 rounded-full transition-all duration-300 hover:bg-[#2a2a2a] hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg"
        >
          Get Started
          <ArrowRight className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
}
