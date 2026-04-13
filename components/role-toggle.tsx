'use client';

import { useTransition } from 'react';
import { toggleUserRole } from '@/app/actions/user';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

export function RoleToggle({ currentRole }: { currentRole: string }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleUserRole(currentRole);
    });
  };

  return (
    <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit shadow-inner border border-slate-200/50">
      <button
        onClick={() => handleToggle('renter')}
        disabled={isPending}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ease-in-out active:scale-[0.97] ${
          currentRole === 'renter'
            ? 'bg-slate-950 text-white shadow-xl'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <ShoppingBag className="w-4 h-4" />
        Renting
      </button>
      <button
        onClick={() => handleToggle('lender')}
        disabled={isPending}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ease-in-out active:scale-[0.97] ${
          currentRole === 'lender'
            ? 'bg-slate-950 text-white shadow-xl'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <Package className="w-4 h-4" />
        Lending
      </button>
    </div>
  );
}
