"use client";

import { useTransition, useState } from 'react';
import { 
  acceptRequest, 
  rejectRequest, 
  markAsActive, 
  markAsCompleted,
  createCheckoutSession
} from '@/app/actions/request';
import { Loader2, CheckCircle2, Clock, PackageCheck, Ban, CreditCard, Wallet, Edit2, Trash2, XCircle } from 'lucide-react';
import { EditRequestModal } from './edit-request-modal';
import { DeleteRequestButton } from './delete-request-button';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
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
  paymentStatus?: string;
  // Metadata for renter actions (edit/delete)
  itemId?: string;
  startDate?: Date;
  endDate?: Date;
  itemTitle?: string;
}

export function RequestActionButtons({ 
  requestId, 
  status, 
  isOwner = false, 
  paymentStatus = 'pending',
  itemId,
  startDate,
  endDate,
  itemTitle
}: RequestActionProps) {
  const [isPending, startTransition] = useTransition();
  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const router = useRouter();

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

  const handlePayNow = async () => {
    startTransition(async () => {
      const res = await createCheckoutSession(requestId);
      if (res?.success && res.url) {
        router.push(res.url);
      } else if (res?.error) {
        alert(res.error);
      }
    });
  };

  // --- RENTER VIEW (Status Labels & Pay Now) ---
  if (!isOwner) {
    if (status === 'pending') {
      return (
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shadow-sm whitespace-nowrap w-fit gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Waiting for Owner
            </span>
            <span className="text-[11px] text-slate-500 font-bold ml-1">Review in progress</span>
          </div>

          {/* Renter specific pending actions */}
          <div className="flex items-center gap-2 ml-2">
            {itemId && startDate && endDate && itemTitle && (
              <EditRequestModal
                requestId={requestId}
                itemId={itemId}
                initialStartDate={startDate}
                initialEndDate={endDate}
                itemTitle={itemTitle}
              />
            )}
            <DeleteRequestButton requestId={requestId} />
          </div>
        </div>
      );
    }
    if (status === 'accepted') {
      if (paymentStatus !== 'paid') {
        return (
          <div className="flex flex-col gap-3">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-amber-50 text-amber-600 border border-amber-100 shadow-sm whitespace-nowrap w-fit gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Waiting for Payment
            </span>
            <Button 
              onClick={handlePayNow}
              disabled={isPending}
              className="bg-slate-950 hover:bg-black text-white rounded-full h-10 px-6 font-black text-[13px] shadow-lg active:scale-95 transition-all flex items-center gap-2"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4" /> Pay Now</>}
            </Button>
          </div>
        );
      }
      return (
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-blue-50 text-blue-600 border border-blue-100 shadow-sm whitespace-nowrap w-fit gap-1.5">
            <Wallet className="w-3.5 h-3.5" /> Ready for Pickup
          </span>
          <span className="text-[11px] text-blue-500 font-bold ml-1">Secure payment received</span>
        </div>
      );
    }
    if (status === 'active') {
      return (
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm whitespace-nowrap w-fit gap-1.5">
            <PackageCheck className="w-3.5 h-3.5" /> In Use
          </span>
          <span className="text-[11px] text-emerald-500 font-bold ml-1">Keep the gear safe!</span>
        </div>
      );
    }
    if (status === 'completed') {
      return (
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-purple-50 text-purple-600 border border-purple-100 shadow-sm whitespace-nowrap w-fit gap-1.5">
            Completed
          </span>
          <span className="text-[11px] text-purple-500 font-bold ml-1">Gear returned successfully</span>
        </div>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-red-50 text-red-600 border border-red-100 shadow-sm whitespace-nowrap w-fit gap-1.5">
          <Ban className="w-3.5 h-3.5" /> Rejected
        </span>
      );
    }
    return null;
  }

  // --- OWNER VIEW (Action Buttons & Guarded Handover) ---
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-purple-50 text-purple-600 whitespace-nowrap shadow-sm border border-purple-100">
        Completed
      </span>
    );
  }

  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-red-50 text-red-600 whitespace-nowrap shadow-sm border border-red-100">
        <Ban className="w-3.5 h-3.5 mr-1.5" /> Rejected
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
              className="flex-1 rounded-full h-12 font-black text-[13px] bg-slate-950 text-white shadow-md transition-all duration-200 ease-in-out active:scale-95"
            >
              Approve Rental
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setIsRejectOpen(true)}
              disabled={isPending}
              className="px-4 rounded-full h-12 font-bold text-[13px] text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 ease-in-out active:scale-95"
            >
              Decline
            </Button>
          </>
        )}

        {status === 'accepted' && (
          <div className="flex flex-col gap-2 w-full">
            {paymentStatus !== 'paid' ? (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-600 border border-amber-100 shadow-sm whitespace-nowrap w-fit gap-1.5 animate-pulse">
                <Clock className="w-3 h-3" /> Waiting for Payment
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-600 border border-blue-100 shadow-sm whitespace-nowrap w-fit gap-1.5">
                <CheckCircle2 className="w-3 h-3" /> Ready for Pickup
              </span>
            )}
            <Button 
              size="lg" 
              onClick={() => handleAction(markAsActive)}
              disabled={isPending || paymentStatus !== 'paid'}
              className="w-full rounded-full h-12 font-black text-[13px] bg-slate-950 text-white hover:bg-black shadow-md transition-all duration-200 ease-in-out active:scale-95 disabled:opacity-40"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mark as Handed Over"}
            </Button>
          </div>
        )}

        {status === 'active' && (
          <div className="flex flex-col gap-2 w-full">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm whitespace-nowrap w-fit gap-1.5">
              <PackageCheck className="w-3 h-3" /> In Use
            </span>
            <Button 
              size="lg"
              onClick={() => handleAction(markAsCompleted)}
              disabled={isPending}
              className="w-full bg-slate-950 text-white font-black rounded-full h-12 text-[13px] hover:bg-black transition-all duration-200 ease-in-out disabled:opacity-40 shadow-md active:scale-95"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mark as Returned"}
            </Button>
          </div>
        )}
      </div>

      {/* Accept Confirmation Modal */}
      <Dialog open={isAcceptOpen} onOpenChange={setIsAcceptOpen}>
        <DialogContent className="max-w-[380px] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Confirm Accept</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium pt-2 leading-relaxed">
              Accepting this request will mark the item as booked for these dates. The renter will be notified to pay.
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

