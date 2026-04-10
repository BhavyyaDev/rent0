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

  const isLender = currentRole === 'lender';

  return (
    <Button 
      variant="outline"
      onClick={handleToggle}
      disabled={isPending}
      className={`rounded-full h-12 px-6 font-bold flex items-center gap-2 border-slate-200 transition-all shadow-sm ${
        isLender 
          ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800' 
          : 'text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800'
      }`}
    >
      <RefreshCcw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
      {isPending ? 'Switching View...' : `Switch to ${isLender ? 'Renter' : 'Lender'} View`}
    </Button>
  );
}
