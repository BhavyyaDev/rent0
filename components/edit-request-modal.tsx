"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from './ui/button';
import { updateRequestDates, checkAvailability } from '@/app/actions/request';
import { Loader2, Calendar as CalendarIcon, Clock, ChevronRight, Edit2 } from 'lucide-react';
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", 
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", 
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"
];

const parseTimeToHours = (timeStr: string) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
  return { hours: Number(hours), minutes: Number(minutes) };
};

const getInitialTime = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const modifier = hours >= 12 ? 'PM' : 'AM';
  let h = hours % 12;
  if (h === 0) h = 12;
  const hStr = h < 10 ? `0${h}` : `${h}`;
  const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hStr}:${mStr} ${modifier}`;
};

interface EditRequestModalProps {
  requestId: string;
  itemId: string;
  initialStartDate: Date;
  initialEndDate: Date;
  itemTitle: string;
}

export function EditRequestModal({ 
  requestId, 
  itemId, 
  initialStartDate, 
  initialEndDate,
  itemTitle 
}: EditRequestModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: initialStartDate,
    to: initialEndDate,
  });
  
  const [startTime, setStartTime] = useState(getInitialTime(initialStartDate));
  const [endTime, setEndTime] = useState(getInitialTime(initialEndDate));
  
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [isCheckingDates, setIsCheckingDates] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const datesSelected = date?.from && date?.to;

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
      // Don't check if it's the exact same as original
      if (finalStart.getTime() === initialStartDate.getTime() && finalEnd.getTime() === initialEndDate.getTime()) {
        setIsAvailable(true);
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
      const timeoutId = setTimeout(() => verify(), 400); 
      return () => clearTimeout(timeoutId);
    } else {
      setIsAvailable(null);
    }
  }, [datesSelected, finalStart?.toISOString(), finalEnd?.toISOString(), itemId, initialStartDate, initialEndDate]);

  const handleUpdate = async () => {
    if (!finalStart || !finalEnd) return;

    setIsPending(true);
    setErrorMsg('');
    
    const res = await updateRequestDates(requestId, finalStart, finalEnd);
    if (res?.error) {
      setErrorMsg(res.error);
      setIsPending(false);
    } else {
      setIsOpen(false);
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-slate-400 hover:text-blue-500 transition-colors p-1" title="Edit Request">
          <Edit2 className="w-5 h-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden bg-white">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-2xl font-extrabold text-[#222222]">Edit Rental Request</DialogTitle>
          <DialogDescription className="text-[15px] font-medium text-slate-500 mt-1">
            Update your dates for <span className="text-slate-900 font-bold">{itemTitle}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 flex flex-col gap-6">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-20 rounded-2xl justify-start text-left font-normal border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 relative group transition-all p-0",
                  !date && "text-slate-500"
                )}
              >
                <div className="flex items-center justify-between w-full h-full">
                  <div className="flex flex-col flex-1 px-6 border-r border-slate-100 h-full justify-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Check-in</span>
                    <span className={cn("text-[15px]", date?.from ? "font-bold text-[#222222]" : "text-slate-400 font-medium")}>
                      {date?.from ? format(date.from, "MMM dd, yyyy") : "Add dates"}
                    </span>
                  </div>
                  
                  <div className="flex flex-col flex-1 px-6 h-full justify-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Checkout</span>
                    <span className={cn("text-[15px]", date?.to ? "font-bold text-[#222222]" : "text-slate-400 font-medium")}>
                      {date?.to ? format(date.to, "MMM dd, yyyy") : "Add dates"}
                    </span>
                  </div>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden" align="center">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={1}
                disabled={{ before: new Date() }}
                className="p-4"
              />
            </PopoverContent>
          </Popover>

          <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-2">
               <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5"><Clock className="w-3 h-3"/> Pickup Time</label>
               <select 
                 value={startTime} 
                 onChange={(e) => setStartTime(e.target.value)}
                 className="bg-slate-50 border-2 border-slate-50 py-3 px-4 rounded-xl outline-none font-bold text-slate-700 text-sm focus:border-slate-200 transition-all"
               >
                 {TIME_SLOTS.map(t => <option key={`start-${t}`} value={t}>{t}</option>)}
               </select>
             </div>
             <div className="flex flex-col gap-2">
               <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5"><Clock className="w-3 h-3"/> Return Time</label>
               <select 
                 value={endTime} 
                 onChange={(e) => setEndTime(e.target.value)}
                 className="bg-slate-50 border-2 border-slate-50 py-3 px-4 rounded-xl outline-none font-bold text-slate-700 text-sm focus:border-slate-200 transition-all"
               >
                 {TIME_SLOTS.map(t => <option key={`end-${t}`} value={t}>{t}</option>)}
               </select>
             </div>
          </div>

          {datesSelected && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              {isCheckingDates ? (
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-slate-600 font-bold text-sm">Checking availability...</p>
                </div>
              ) : isAvailable === true ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-emerald-700 font-bold text-[14px]">Available for new dates</p>
                </div>
              ) : isAvailable === false ? (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                  <p className="text-red-700 font-bold text-[14px]">Not available for these dates</p>
                </div>
              ) : null}
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center animate-in fade-in zoom-in-95">
              <p className="text-red-700 font-bold text-[14px]">{errorMsg}</p>
            </div>
          )}
        </div>

        <DialogFooter className="p-8 bg-slate-50 mt-2">
          <div className="flex items-center justify-between w-full gap-4">
            <Button 
              variant="ghost" 
              onClick={() => setIsOpen(false)}
              className="rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={isPending || !datesSelected || isAvailable === false || isCheckingDates}
              className="rounded-xl px-8 font-extrabold bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 active:scale-95 transition-all h-12 flex-1"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </span>
              ) : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
