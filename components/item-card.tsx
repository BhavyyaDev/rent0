"use client";

import Link from 'next/link';
import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Item {
  id: string;
  title: string;
  description: string;
  pricePerDay: number;
  imageUrl: string | null;
  ownerId: string;
  category?: string;
  createdAt: Date;
  owner?: {
    id: string;
    name: string | null;
    email: string;
    trustScore?: number;
    createdAt?: Date;
  };
  requests?: any[];
  hasBookingConflict?: boolean;
}

export function ItemCard({ item, dateFilterActive }: { item: Item, dateFilterActive?: boolean }) {
  const fallbackImg = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
  const [imgSrc, setImgSrc] = useState(item.imageUrl || fallbackImg);

  const now = new Date();
  const currentBooking = item.requests?.find(req => {
    const start = new Date(req.startDate);
    const end = new Date(req.endDate);
    return now >= start && now <= end;
  });

  const isBookedNow = !!currentBooking;
  const isDimmed = dateFilterActive ? item.hasBookingConflict : isBookedNow;

  const nextAvailableDate = isBookedNow 
    ? new Date(new Date(currentBooking.endDate).getTime() + 86400000) 
    : null;

  return (
    <Link href={`/items/${item.id}`} className="group block focus:outline-none cursor-pointer active:scale-95 transition-all duration-200 ease-in-out">
      <div className={cn(
        "flex flex-col gap-1 transition-all duration-200 ease-in-out bg-white p-3 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5",
        isDimmed && "opacity-40 grayscale-[0.8]"
      )}>
        {/* Image Section */}
        <div className="w-full aspect-[20/19] relative overflow-hidden rounded-xl bg-[#F7F7F7] shadow-inner mb-3 border border-slate-200/50">
          {isDimmed && (
            <div className="absolute inset-0 bg-slate-900/10 z-10 flex items-center justify-center backdrop-blur-[1px] transition-all">
              <span className="bg-slate-900/90 text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                {dateFilterActive ? 'Unavailable' : 'Booked Now'}
              </span>
            </div>
          )}
          <img 
            src={imgSrc} 
            alt={item.title} 
            onError={() => setImgSrc(fallbackImg)}
            className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-105" 
          />
          
          {/* Marketplace Status Badges */}
          <div className="absolute top-3 left-3 z-[15] flex flex-col gap-1.5">
            {new Date(item.createdAt).getTime() > new Date().getTime() - (7 * 24 * 60 * 60 * 1000) && (
              <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wider animate-in fade-in zoom-in duration-500">
                New
              </span>
            )}
            {(item.requests?.length || 0) > 2 && (
              <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wider animate-in fade-in zoom-in duration-500">
                Popular
              </span>
            )}
          </div>

          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content Section */}
        <div className="flex flex-col px-0.5 pb-1">
          <div className="flex justify-between items-start gap-2">
            <span className="font-semibold text-[13px] text-slate-400 uppercase tracking-widest leading-none">
              {item.category && item.category !== 'Other' ? item.category.toLowerCase() : 'Equipment'}
            </span>
            <div className="flex items-center gap-1 opacity-90">
              <span className="text-[13px] text-amber-600 font-extrabold tracking-tight">{(item.owner?.trustScore ?? 100)}</span>
              <ShieldCheck className="w-[12px] h-[12px] text-emerald-500" strokeWidth={3} />
            </div>
          </div>
          
          <h3 className="text-[16px] text-slate-950 font-black line-clamp-1 mt-1.5 leading-tight tracking-tight">
            {item.title}
          </h3>
          
          <div className="text-[14px] text-slate-500 font-bold flex items-center gap-1.5 mt-0.5">
            <span className="line-clamp-1">Listed by {item.owner?.name?.split(' ')[0] || 'Verified Owner'}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50" />
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <div className="flex items-baseline gap-1">
              <span className="font-black text-[18px] text-slate-950 tracking-tighter">₹{item.pricePerDay.toLocaleString()}</span>
              <span className="text-[13px] text-slate-400 font-bold uppercase tracking-wider">/ day</span>
            </div>

            {/* Realtime Availability Indication */}
            <div className="flex flex-col gap-1">
              {!isBookedNow ? (
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50/80 px-2 py-1 rounded-md w-fit inline-flex items-center gap-1.5 mt-0.5 border border-emerald-100/50">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Available Today
                </span>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-amber-700 font-bold bg-amber-50/90 px-2 py-1 rounded-md w-fit inline-flex items-center gap-1.5 mt-0.5 border border-amber-200/50">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Unavailable
                  </span>
                  {nextAvailableDate && (
                    <span className="text-[10px] text-slate-400 font-bold ml-1">
                      Available: {nextAvailableDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
