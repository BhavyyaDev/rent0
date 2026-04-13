"use client";

import { useTransition, useState } from 'react';
import { 
  acceptRequest, 
  rejectRequest, 
  markAsActive, 
  markAsCompleted 
} from '@/app/actions/request';
import { Loader2, CheckCircle2, Clock, PackageCheck, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from "@/components/ui/dialog";

interface RequestActionProps {
  requestId: string;
  status: string;
  isOwner?: boolean;
}

export function RequestActionButtons({ requestId, status, isOwner = false }: RequestActionProps) {
  const [isPending, startTransition] = useTransition();
  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const handleAction = async (action: (id: string) => Promise<any>) => {
    setIsAcceptOpen(false);
    setIsRejectOpen(false);
    startTransition(async () => {
      const res = await action(requestId);
      if (res?.error) {
        alert(res.error);
      }
    });
  };

  // --- RENTER VIEW (Status Labels Only) ---
  if (!isOwner) {
    if (status === 'pending') {
      return (
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shadow-sm whitespace-nowrap w-fit gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Waiting for owner approval
          </span>
          <span className="text-[11px] text-slate-500 font-bold ml-1">Owner will respond soon</span>
        </div>
      );
    }
    if (status === 'accepted') {
      return (
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm whitespace-nowrap w-fit gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved - ready for pickup
          </span>
          <span className="text-[11px] text-emerald-600 font-bold ml-1">Coordinate pickup with owner</span>
        </div>
      );
    }
    if (status === 'active') {
      return (
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-blue-100 text-blue-700 border border-blue-200 shadow-sm whitespace-nowrap w-fit gap-1.5">
            <PackageCheck className="w-3.5 h-3.5" /> Currently rented
          </span>
          <span className="text-[11px] text-blue-500 font-bold ml-1">Keep the gear safe!</span>
        </div>
      );
    }
    if (status === 'completed') {
      return (
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-purple-100 text-purple-700 border border-purple-200 shadow-sm whitespace-nowrap w-fit gap-1.5">
            Completed
          </span>
          <span className="text-[11px] text-purple-500 font-bold ml-1">Gear returned successfully</span>
        </div>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-red-100 text-red-700 border border-red-200 shadow-sm whitespace-nowrap w-fit gap-1.5">
          <Ban className="w-3.5 h-3.5" /> Request declined
        </span>
      );
    }
    return null;
  }

  // --- OWNER VIEW (Action Buttons) ---
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-purple-100 text-purple-700 whitespace-nowrap shadow-sm border border-purple-200">
        Completed
      </span>
    );
  }

  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-red-100 text-red-700 whitespace-nowrap shadow-sm border border-red-200">
        Rejected
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        {status === 'pending' && (
          <>
            <Button 
              size="lg" 
              onClick={() => setIsAcceptOpen(true)}
              disabled={isPending}
              className="flex-1 rounded-full h-12 font-black text-[13px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all duration-200 ease-in-out active:scale-95"
            >
              Approve Rental
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setIsRejectOpen(true)}
              disabled={isPending}
              className="px-6 rounded-full h-12 font-black text-[13px] border-2 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-red-600 hover:border-red-100 transition-all duration-200 ease-in-out active:scale-95"
            >
              Decline
            </Button>
          </>
        )}

        {status === 'accepted' && (
          <Button 
            size="lg" 
            onClick={() => handleAction(markAsActive)}
            disabled={isPending}
            className="w-full rounded-full h-12 font-black text-[13px] bg-slate-950 text-white hover:bg-black shadow-md transition-all duration-200 ease-in-out active:scale-95"
          >
            Mark as Handed Over
          </Button>
        )}

        {status === 'active' && (
          <Button 
            size="lg"
            onClick={() => handleAction(markAsCompleted)}
            disabled={isPending}
            className="w-full bg-emerald-600 text-white font-black rounded-full h-12 text-[13px] hover:bg-emerald-700 transition-all duration-200 ease-in-out disabled:opacity-40 shadow-md active:scale-95"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Rental & Release Deposit"}
          </Button>
        )}
      </div>

      {/* Accept Confirmation Modal */}
      <Dialog open={isAcceptOpen} onOpenChange={setIsAcceptOpen}>
        <DialogContent className="max-w-[380px] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Confirm Accept</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium pt-2 leading-relaxed">
              Accepting this request will mark the item as booked for these dates.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-6">
            <Button 
              onClick={() => handleAction(acceptRequest)} 
              disabled={isPending}
              className="w-full bg-slate-950 hover:bg-black text-white font-black h-14 rounded-full shadow-md transition-all duration-200 ease-in-out active:scale-95"
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
            <DialogTitle className="text-xl font-bold text-slate-900">Confirm Reject</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium pt-2 leading-relaxed">
              Are you sure you want to decline this rental request?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-6">
            <Button 
              onClick={() => handleAction(rejectRequest)} 
              disabled={isPending}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-full transition-all duration-200 ease-in-out active:scale-95"
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
