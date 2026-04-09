"use client";

import { useState, useMemo } from 'react';
import { Button } from './ui/button';

export function BookingWidget({ pricePerDay }: { pricePerDay: number }) {
  const [showDates, setShowDates] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center mb-5">
                <p className="text-emerald-700 font-bold text-sm">✨ Available for selected dates</p>
              </div>
              
              <div className="flex flex-col gap-3 py-2">
                <div className="flex justify-between items-center text-slate-600 font-medium text-[15px]">
                  <span className="underline decoration-slate-300 underline-offset-4">${pricePerDay.toFixed(2)} x {days} {days === 1 ? 'day' : 'days'}</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-900 font-extrabold text-lg pt-4 border-t border-slate-100 mt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full rounded-full text-lg h-14 font-extrabold shadow-xl shadow-emerald-500/20 transition-all bg-emerald-500 text-white hover:bg-emerald-600 hover:-translate-y-1 mt-4"
              >
                Rent Now
              </Button>
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
