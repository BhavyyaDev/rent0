"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from './ui/button';
import { createRequest, checkAvailability } from '@/app/actions/request';
import { Loader2 } from 'lucide-react';

export function BookingWidget({ itemId, pricePerDay }: { itemId: string, pricePerDay: number }) {
  const [showDates, setShowDates] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [isPending, setIsPending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [isCheckingDates, setIsCheckingDates] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const datesSelected = startDate && endDate;

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const sDate = new Date(start);
    const eDate = new Date(end);
    const timeDiff = eDate.getTime() - sDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff > 0 ? daysDiff : 1; // Minimum 1 day rental
  };

  const days = useMemo(() => calculateDays(startDate, endDate), [startDate, endDate]);
  const total = pricePerDay * days;

  useEffect(() => {
    if (datesSelected) {
      const verify = async () => {
        setIsCheckingDates(true);
        setIsAvailable(null);
        setErrorMsg('');
        const res = await checkAvailability(itemId, startDate, endDate);
        setIsAvailable(res.available);
        setIsCheckingDates(false);
      };
      verify();
    } else {
      setIsAvailable(null);
    }
  }, [startDate, endDate, itemId, datesSelected]);

  const handleRentNow = async () => {
    setIsPending(true);
    setSuccessMsg('');
    setErrorMsg('');
    
    const res = await createRequest(itemId, startDate, endDate);
    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg('Request sent successfully ✅');
    }
    setIsPending(false);
  };

  return (
    <div className="flex flex-col w-full mt-2">
      {!showDates ? (
        <Button 
          size="lg" 
          onClick={() => setShowDates(true)}
          className="w-full rounded-full text-lg h-14 font-semibold shadow-xl shadow-emerald-500/20 transition-all bg-emerald-500 text-white hover:bg-emerald-600"
        >
          Check Availability
        </Button>
      ) : (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-2 gap-3 border border-slate-300 rounded-[16px] overflow-hidden bg-white p-1">
            <div className="flex flex-col gap-1 p-2 border-r border-slate-200">
              <label className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider ml-1">Check-in</label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="bg-transparent border-none p-1 outline-none text-slate-700 font-medium cursor-pointer text-sm"
              />
            </div>
            <div className="flex flex-col gap-1 p-2">
              <label className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider ml-1">Checkout</label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                className="bg-transparent border-none p-1 outline-none text-slate-700 font-medium cursor-pointer text-sm"
              />
            </div>
          </div>

          {datesSelected ? (
            <div className="flex flex-col animate-in fade-in zoom-in-95 duration-300">
              {isCheckingDates ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center mb-5 animate-pulse">
                  <p className="text-slate-600 font-bold text-sm">Checking dates...</p>
                </div>
              ) : isAvailable === true ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center mb-5 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-emerald-700 font-bold text-sm">Available for your selected dates</p>
                </div>
              ) : isAvailable === false ? (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center mb-5">
                  <p className="text-red-700 font-bold text-sm">Not available for selected dates</p>
                </div>
              ) : null}
              
              <div className="flex flex-col gap-3 py-2">
                <div className="flex justify-between items-center text-slate-600 font-medium text-[15px]">
                  <span className="underline decoration-slate-300 underline-offset-4">₹{pricePerDay.toLocaleString()} x {days} {days === 1 ? 'day' : 'days'}</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-900 font-extrabold text-lg pt-4 border-t border-slate-100 mt-2">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center mt-2 animate-in fade-in duration-300">
                  <p className="text-emerald-700 font-bold text-sm tracking-tight">{successMsg}</p>
                </div>
              )}
              {errorMsg && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center mt-2 animate-in fade-in duration-300">
                  <p className="text-red-700 font-bold text-sm">{errorMsg}</p>
                </div>
              )}

              <Button 
                size="lg" 
                onClick={handleRentNow}
                disabled={isPending || !!successMsg || isAvailable === false || isCheckingDates}
                className="w-full rounded-full text-lg h-14 font-extrabold shadow-xl shadow-emerald-500/20 transition-all bg-emerald-500 text-white hover:bg-emerald-600 hover:-translate-y-1 mt-4 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Request...
                  </span>
                ) : successMsg ? 'Request Sent' : 'Rent Now'}
              </Button>
              
              <div className="mt-4 text-center">
                 <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    High demand item
                 </span>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <Button 
                size="lg" 
                disabled
                className="w-full rounded-full text-lg h-14 font-bold shadow-md opacity-50 bg-slate-900 text-white cursor-not-allowed"
              >
                Select dates
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
