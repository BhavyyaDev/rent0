"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from './ui/button';
import { createRequest, checkAvailability } from '@/app/actions/request';
import { Loader2, Calendar as CalendarIcon, Clock, ChevronRight, ArrowRight } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from "@/components/ui/dialog";

const TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", 
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", 
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"
];

// Helper to convert frontend 12H string back to standard timestamp offsets
const parseTimeToHours = (timeStr: string) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
  return { hours: Number(hours), minutes: Number(minutes) };
};

export function BookingWidget({ 
  itemId, 
  itemTitle,
  pricePerDay,
  bookedRanges = [] 
}: { 
  itemId: string, 
  itemTitle: string,
  pricePerDay: number,
  bookedRanges?: { from: string, to: string }[]
}) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // Convert string ranges back to Date objects for react-day-picker
  const bookedDays = useMemo(() => {
    return bookedRanges.map(range => ({
      from: new Date(range.from),
      to: new Date(range.to)
    }));
  }, [bookedRanges]);

  const disabledDays = useMemo(() => {
    return [
      { before: new Date() }, // Past dates
      ...bookedDays
    ];
  }, [bookedDays]);
  
  const [date, setDate] = useState<DateRange | undefined>();
  const [startTime, setStartTime] = useState("10:00 AM");
  const [endTime, setEndTime] = useState("10:00 AM");
  
  const [isPending, setIsPending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [isCheckingDates, setIsCheckingDates] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const datesSelected = date?.from && date?.to;

  const calculateDays = (start?: Date, end?: Date) => {
    if (!start || !end) return 0;
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    // Step 1: Minimum 1 day and Math.ceil for safety
    return daysDiff > 0 ? daysDiff : 1; 
  };

  const days = useMemo(() => calculateDays(date?.from, date?.to), [date?.from, date?.to]);
  const total = pricePerDay * days;

  const getCombinedDate = (d?: Date, tStr?: string) => {
    if (!d || !tStr) return undefined;
    const newD = new Date(d);
    const time = parseTimeToHours(tStr);
    newD.setHours(time.hours, time.minutes, 0, 0);
    return newD;
  };

  const finalStart = useMemo(() => getCombinedDate(date?.from, startTime), [date?.from, startTime]);
  const finalEnd = useMemo(() => getCombinedDate(date?.to, endTime), [date?.to, endTime]);

  useEffect(() => {
    if (datesSelected && finalStart && finalEnd) {
      // Direct chronological validation
      if (finalStart >= finalEnd) {
        setIsAvailable(null);
        setErrorMsg('End date must be after start date');
        setIsCheckingDates(false);
        return;
      }

      const verify = async () => {
        setIsCheckingDates(true);
        setIsAvailable(null);
        setErrorMsg('');
        const res = await checkAvailability(itemId, finalStart.toISOString(), finalEnd.toISOString());
        setIsAvailable(res.available);
        setIsCheckingDates(false);
      };
      // Simple debounce to avoid spamming the DB while dragging
      const timeoutId = setTimeout(() => verify(), 400); 
      return () => clearTimeout(timeoutId);
    } else {
      setIsAvailable(null);
    }
  }, [datesSelected, finalStart?.toISOString(), finalEnd?.toISOString(), itemId]);

  const handleRentNow = () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setErrorMsg('Please sign in to continue');
      setTimeout(() => {
        router.push('/sign-in');
      }, 1200);
      return;
    }
    if (!finalStart || !finalEnd || finalStart >= finalEnd) return;
    setIsConfirmModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!finalStart || !finalEnd) return;
    
    setIsPending(true);
    setSuccessMsg('');
    setErrorMsg('');
    
    // Step 4 & 6: Actual server request on final confirmation
    const res = await createRequest(itemId, finalStart.toISOString(), finalEnd.toISOString());
    if (res?.error) {
      setErrorMsg(res.error);
      setIsConfirmModalOpen(false);
    } else {
      setSuccessMsg('Request sent successfully ✅');
      setIsConfirmModalOpen(false);
      // Optional: auto-redirect after brief delay or stay for feedback
    }
    setIsPending(false);
  };

  const handleSetDate = (newRange: DateRange | undefined) => {
    if (newRange?.from && newRange?.to) {
      // Check if any date in the range is disabled (booked)
      const isUnavailable = bookedRanges.some(range => {
        const bookedFrom = new Date(range.from);
        const bookedTo = new Date(range.to);
        // If selected range encompasses or touches a booked range
        return (newRange.from! <= bookedTo && newRange.to! >= bookedFrom);
      });

      if (isUnavailable) {
        setErrorMsg('Some dates in your selection are unavailable.');
        return;
      }
    }
    setDate(newRange);
    setErrorMsg('');
  };

  return (
    <div className="flex flex-col w-full mt-2 bg-white rounded-3xl pb-2 shadow-sm border border-slate-100 p-6">
       
      <div className="mb-6 flex justify-between items-baseline">
         <span className="text-2xl font-extrabold text-slate-900">₹{pricePerDay.toLocaleString()} <span className="text-base font-normal text-slate-500">day</span></span>
         {bookedRanges.length > 0 && (
           <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">Some dates unavailable</span>
         )}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full h-16 rounded-2xl justify-start text-left font-normal border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 relative group transition-all",
              !date && "text-slate-500"
            )}
          >
            <div className="flex items-center justify-between w-full p-2">
              <div className="flex flex-col flex-1 pl-2 border-r border-slate-200/50">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#222222]">Check-in</span>
                <span className={cn("text-[14px]", date?.from ? "font-bold text-[#222222]" : "text-slate-400 font-medium")}>
                  {date?.from ? format(date.from, "MMM dd, yyyy") : "Add dates"}
                </span>
              </div>
              
              <div className="flex flex-col flex-1 pl-4 shrink-0">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#222222]">Checkout</span>
                <span className={cn("text-[14px]", date?.to ? "font-bold text-[#222222]" : "text-slate-400 font-medium")}>
                  {date?.to ? format(date.to, "MMM dd, yyyy") : "Add dates"}
                </span>
              </div>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-0 rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden" align="center">
          <div className="bg-white p-2">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleSetDate}
              numberOfMonths={2}
              disabled={disabledDays}
              modifiers={{ booked: bookedDays }}
              className="p-4"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-8 sm:space-y-0",
              }}
            />
          </div>
          {/* Optional Time Selector Bar */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 border-t border-slate-100">
             <div className="flex-1 flex flex-col gap-1.5">
               <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5"><Clock className="w-3 h-3"/> Pickup Time</label>
               <select 
                 value={startTime} 
                 onChange={(e) => setStartTime(e.target.value)}
                 className="bg-white border border-slate-200 py-2 px-3 rounded-xl outline-none font-bold text-slate-700 text-sm shadow-sm"
               >
                 {TIME_SLOTS.map(t => <option key={`start-${t}`} value={t}>{t}</option>)}
               </select>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300 mx-1 mt-4" />
             <div className="flex-1 flex flex-col gap-1.5">
               <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5"><Clock className="w-3 h-3"/> Return Time</label>
               <select 
                 value={endTime} 
                 onChange={(e) => setEndTime(e.target.value)}
                 className="bg-white border border-slate-200 py-2 px-3 rounded-xl outline-none font-bold text-slate-700 text-sm shadow-sm"
               >
                 {TIME_SLOTS.map(t => <option key={`end-${t}`} value={t}>{t}</option>)}
               </select>
             </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Confirmation Layout Block */}
      {/* Confirmation Layout Block - Show if dates selected */}
      {datesSelected ? (
        <div className="flex flex-col animate-in fade-in zoom-in-95 duration-300 mt-6">
          {isCheckingDates ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center mb-5 animate-pulse">
              <p className="text-slate-600 font-bold text-sm">Checking dates...</p>
            </div>
          ) : isAvailable === true ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center mb-5 flex items-center justify-center gap-2 transition-all">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-emerald-700 font-bold text-[14px]">Available for selected dates</p>
            </div>
          ) : isAvailable === false ? (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center mb-5">
              <p className="text-red-700 font-bold text-[14px]">Oh no! Not available for selected dates</p>
            </div>
          ) : null}
          
          {/* Step 5: If unavailable -> hide price details */}
          {isAvailable !== false && (
            <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100/80 mb-6 font-medium">
              <div className="flex flex-col gap-3.5">
                <div className="flex justify-between items-center text-slate-600 text-[15px]">
                  <span className="flex items-center gap-1">
                    ₹{pricePerDay.toLocaleString()}/day × {days} {days === 1 ? 'day' : 'days'}
                  </span>
                  <span className="font-bold text-slate-900">₹{total.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center text-slate-900 font-extrabold text-lg pt-4 border-t border-slate-200">
                  <span>Total Price</span>
                  <span className="text-[#FF385C]">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center mt-4 animate-in fade-in duration-300">
              <p className="text-emerald-700 font-bold text-[14px] tracking-tight">{successMsg}</p>
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center mt-4 animate-in fade-in duration-300">
              <p className="text-red-700 font-bold text-[14px]">{errorMsg}</p>
            </div>
          )}

          <Button 
            size="lg" 
            onClick={handleRentNow}
            disabled={isPending || !!successMsg || isAvailable === false || isCheckingDates || !isLoaded || (finalStart! >= finalEnd!)}
            className="w-full rounded-2xl text-lg h-14 font-extrabold transition-all bg-[#FF385C] text-white hover:bg-[#D90B3E] mt-6 shadow-[0_6px_16px_rgba(255,56,92,0.3)] disabled:opacity-50 disabled:shadow-none hover:-translate-y-[1px]"
          >
            {!isLoaded ? 'Loading...' : !isSignedIn ? 'Sign in to book' : isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing request...
              </span>
            ) : successMsg ? 'Requested' : 'Rent Now'}
          </Button>
          
          <div className="mt-5 text-center flex flex-col items-center gap-2">
            <span className="text-[13px] text-slate-500 font-medium">You won't be charged yet</span>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-100/50">
               <span className="relative flex h-1.5 w-1.5">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
               </span>
               Highly demanded format
            </span>
          </div>
        </div>
      ) : (
        <Button 
          size="lg" 
          disabled
          className="w-full rounded-2xl text-lg h-14 font-extrabold shadow-sm bg-[#FF385C] text-white mt-6 opacity-40 cursor-not-allowed hidden"
        >
          Rent Now
        </Button>
      )}

      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="max-w-[420px] p-0 overflow-hidden rounded-[32px] border-none shadow-2xl">
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-extrabold text-[#222222]">Confirm booking</DialogTitle>
              <DialogDescription className="text-[15px] font-medium text-slate-500 mt-1">
                Please review your rental details before confirming.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col gap-5 mb-8">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Item</span>
                <span className="text-lg font-bold text-slate-900 leading-tight">{itemTitle}</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rental Period</span>
                <div className="flex items-center gap-3 text-[16px] font-bold text-slate-800">
                  <span>{date?.from ? format(date.from, "MMM dd") : ""}</span>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                  <span>{date?.to ? format(date.to, "MMM dd, yyyy") : ""}</span>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-200 flex justify-between items-center">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[12px] font-bold text-slate-400 uppercase tracking-tighter">Total Price</span>
                  <span className="text-2xl font-extrabold text-[#FF385C]">₹{total.toLocaleString()}</span>
                </div>
                <div className="text-right">
                   <span className="text-[13px] font-bold text-slate-500">₹{pricePerDay.toLocaleString()} × {days}d</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                size="lg" 
                onClick={handleConfirmBooking}
                className="w-full h-14 rounded-2xl bg-[#FF385C] hover:bg-[#D90B3E] text-white font-extrabold text-lg shadow-lg shadow-pink-200 transition-all active:scale-[0.98]"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Confirming...
                  </span>
                ) : "Confirm Booking"}
              </Button>
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={() => setIsConfirmModalOpen(false)}
                className="w-full h-12 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
