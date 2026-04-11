"use client";

import { useTransition } from 'react';
import { deleteRequest } from '@/app/actions/request';
import { XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeleteRequestButtonProps {
  requestId: string;
}

export function DeleteRequestButton({ requestId }: DeleteRequestButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Are you sure you want to cancel this rental request?')) {
      startTransition(async () => {
        const res = await deleteRequest(requestId);
        if (res?.error) {
          alert(res.error);
        }
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className={cn(
        "text-slate-400 hover:text-red-500 transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed",
        isPending && "text-red-500"
      )}
      title="Cancel Request"
    >
      {isPending ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <XCircle className="w-5 h-5" />
      )}
    </button>
  );
}
