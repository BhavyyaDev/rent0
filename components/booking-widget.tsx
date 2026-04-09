"use client";

import { useState } from 'react';
import { Button } from './ui/button';

export function BookingWidget({ pricePerDay }: { pricePerDay: number }) {
  const [showDates, setShowDates] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const datesSelected = startDate && endDate;

  return (
    <div className="flex flex-col w-full mt-2">
      {!showDates ? (
        <Button 
          size="lg" 
          onClick={() => setShowDates(true)}
          className="w-full rounded-full text-lg h-14 font-semibold shadow-md hover:shadow-lg transition-all bg-slate-900 text-white hover:bg-slate-800"
        >
          Check Availability
        </Button>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-sm flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-tighter ml-1">Start</label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900 text-slate-700 font-medium cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-tighter ml-1">End</label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900 text-slate-700 font-medium cursor-pointer"
              />
            </div>
          </div>

          {datesSelected && (
            <div className="mt-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center animate-in fade-in zoom-in-95 duration-300">
              <p className="text-emerald-700 font-bold">✨ Available for selected dates</p>
            </div>
          )}

          <Button 
            size="lg" 
            disabled={!datesSelected}
            className="w-full rounded-full text-lg h-14 font-bold shadow-md hover:shadow-lg transition-all bg-[#10b981] text-white hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {datesSelected ? "Rent Now" : "Select dates to rent"}
          </Button>
        </div>
      )}
    </div>
  );
}
