"use client";

import { useTransition, useState } from 'react';
import { updateRequestStatus } from '@/app/actions/request';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function RequestActionButtons({ requestId, status }: { requestId: string, status: string }) {
  const [isPending, startTransition] = useTransition();
  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const confirmAction = async (newStatus: string) => {
    setIsAcceptOpen(false);
    setIsRejectOpen(false);
    startTransition(async () => {
      await updateRequestStatus(requestId, newStatus);
    });
  };

  if (status === 'completed') {
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-blue-100 text-blue-700 whitespace-nowrap shadow-sm border border-blue-200">
        Completed
      </span>
    );
  }

  if (status === 'accepted') {
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-emerald-100 text-emerald-700 whitespace-nowrap shadow-sm border border-emerald-200">
        Booking confirmed
      </span>
    );
  }

  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-red-100 text-red-700 whitespace-nowrap shadow-sm border border-red-200">
        Request declined
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-500 uppercase tracking-widest w-max border border-slate-200 shadow-sm">
        Waiting for owner approval
      </span>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setIsAcceptOpen(true)}
          disabled={isPending}
          className="px-4 py-2 bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-bold rounded-xl text-[13px] hover:bg-emerald-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          Accept
        </button>
        <button 
          onClick={() => setIsRejectOpen(true)}
          disabled={isPending}
          className="px-4 py-2 bg-red-50 border border-red-200/80 text-red-700 font-bold rounded-xl text-[13px] hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          Reject
        </button>
      </div>

      {/* Accept Confirmation Modal */}
      <Dialog open={isAcceptOpen} onOpenChange={setIsAcceptOpen}>
        <DialogContent className="max-w-[380px] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Confirm Accept</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium pt-2">
              Confirm booking for these dates?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button 
              onClick={() => confirmAction('accepted')} 
              disabled={isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Approval"}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setIsAcceptOpen(false)}
              className="w-full text-slate-500 font-bold"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Modal */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-[380px] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Confirm Reject</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium pt-2">
              Are you sure you want to reject?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button 
              onClick={() => confirmAction('rejected')} 
              disabled={isPending}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Rejection"}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setIsRejectOpen(false)}
              className="w-full text-slate-500 font-bold"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
