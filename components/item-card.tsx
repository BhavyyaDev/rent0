"use client";

import Link from 'next/link';
import { useState } from 'react';


import { ShieldCheck } from 'lucide-react';

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

  // Find the end date of the current booking to show "Available from"
  const nextAvailableDate = isBookedNow 
    ? new Date(new Date(currentBooking.endDate).getTime() + 86400000) 
    : null;

  return (
    <Link href={`/items/${item.id}`} className="group block focus:outline-none cursor-pointer">
      <div className={`flex flex-col gap-1 transition-all duration-300 ease-out group-hover:-translate-y-1 ${isDimmed ? 'opacity-40 grayscale-[0.8]' : ''}`}>
        {/* Image Section */}
        <div className="w-full aspect-[20/19] relative overflow-hidden rounded-[16px] bg-[#F7F7F7] shadow-sm group-hover:shadow-lg transition-all duration-300 mb-2">
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
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>

        {/* Content Section */}
        <div className="flex flex-col px-0.5">
          <div className="flex justify-between items-start gap-2">
            <span className="font-semibold text-[15px] text-[#222222] capitalize">
              {item.category && item.category !== 'Other' ? item.category.toLowerCase() : 'Equipment'}
            </span>
            <div className="flex items-center gap-1.5 opacity-90">
              <ShieldCheck className="w-[14px] h-[14px] text-emerald-500" strokeWidth={2.5} />
              <span className="text-[14px] text-[#222222] font-medium leading-[14px]">{(item.owner?.trustScore ?? 100)}</span>
            </div>
          </div>
          
          <h3 className="text-[15px] text-[#717171] font-normal line-clamp-1 mt-0.5">
            {item.title}
          </h3>
          
          <div className="text-[15px] text-[#717171] font-normal line-clamp-1 mt-0.5">
            Listed by {item.owner?.name?.split(' ')[0] || 'Verified Owner'}
          </div>

          <div className="mt-1 flex flex-col gap-2">
            <div className="flex items-baseline gap-1">
              <span className="font-semibold text-[15px] text-[#222222] tracking-tight">₹{item.pricePerDay.toLocaleString()}</span>
              <span className="text-[15px] text-[#222222] font-normal">day</span>
            </div>

            {/* Realtime Availability Indication */}
            <div className="flex flex-col gap-1">
              {!isBookedNow ? (
                <span className="text-[12px] text-emerald-700 font-semibold bg-emerald-50/80 px-2.5 py-1 rounded-md w-fit inline-flex items-center gap-1.5 mt-0.5 border border-emerald-100/50">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Available Today
                </span>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] text-amber-700 font-bold bg-amber-50/90 px-2.5 py-1 rounded-md w-fit inline-flex items-center gap-1.5 mt-0.5 border border-amber-200/50">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Unavailable
                  </span>
                  {nextAvailableDate && (
                    <span className="text-[11px] text-slate-500 font-bold ml-1">
                      Next available: {nextAvailableDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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
