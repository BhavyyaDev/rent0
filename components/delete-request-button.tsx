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
        "border border-red-400 text-red-500 bg-transparent rounded-full h-9 px-4 font-bold text-sm hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5",
        isPending && "opacity-70"
      )}
      title="Cancel Request"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <XCircle className="w-4 h-4" />
      )}
      Cancel
    </button>
  );
}
