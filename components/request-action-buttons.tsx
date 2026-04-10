"use client";

import { useTransition } from 'react';
import { updateRequestStatus } from '@/app/actions/request';

export function RequestActionButtons({ requestId, status }: { requestId: string, status: string }) {
  const [isPending, startTransition] = useTransition();

  const handleAction = async (newStatus: string) => {
    startTransition(async () => {
      await updateRequestStatus(requestId, newStatus);
    });
  };

  if (status === 'accepted') {
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[13px] font-bold bg-emerald-100 text-emerald-700 whitespace-nowrap shadow-sm border border-emerald-200">
        Request accepted ✅
      </span>
    );
  }

  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[13px] font-bold bg-red-100 text-red-700 whitespace-nowrap shadow-sm border border-red-200">
        Request rejected ❌
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-500 uppercase tracking-widest w-max border border-slate-200">
        Pending
      </span>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handleAction('accepted')}
          disabled={isPending}
          className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-bold rounded-xl text-[13px] hover:bg-emerald-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          {isPending ? 'Wait...' : 'Accept'}
        </button>
        <button 
          onClick={() => handleAction('rejected')}
          disabled={isPending}
          className="px-3.5 py-1.5 bg-red-50 border border-red-200/80 text-red-700 font-bold rounded-xl text-[13px] hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          {isPending ? 'Wait...' : 'Reject'}
        </button>
      </div>
    </div>
  );
}
