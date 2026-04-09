"use client";

import Link from 'next/link';
import { useState } from 'react';


export interface Item {
  id: string;
  title: string;
  description: string;
  pricePerDay: number;
  imageUrl: string | null;
  ownerId: string;
  createdAt: Date;
  owner?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export function ItemCard({ item, dateFilterActive }: { item: Item, dateFilterActive?: boolean }) {

  const fallbackImg = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
  const [imgSrc, setImgSrc] = useState(item.imageUrl || fallbackImg);

  return (
    <Link href={`/items/${item.id}`} className="group block focus:outline-none cursor-pointer">
      <div className="flex flex-col gap-3 transition-all duration-300 ease-out group-hover:-translate-y-1">
        {/* Image Section */}
        <div className="w-full aspect-[4/3] relative overflow-hidden rounded-[20px] bg-[#F7F7F7] shadow-sm group-hover:shadow-xl transition-shadow duration-300">
          <img 
            src={imgSrc} 
            alt={item.title} 
            onError={() => setImgSrc(fallbackImg)}
            className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-110" 
          />
          {/* Subtle overlay for better text contrast if needed -- following airbnb's minimal style */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>

        {/* Content Section */}
        <div className="flex flex-col px-0.5">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-[600] text-[16px] text-[#222222] line-clamp-1 leading-[20px]">
              {item.title}
            </h3>
            {/* Optional category tag if needed -- but user didn't ask for it specifically here */}
          </div>
          <p className="text-[14px] mt-[4px] text-[#717171] line-clamp-1 leading-[18px] font-medium">
            {item.description}
          </p>
          <div className="mt-[8px] flex flex-col gap-1.5">
            <div className="flex items-baseline gap-1">
              <span className="font-[600] text-[16px] text-[#222222]">₹{item.pricePerDay.toLocaleString()}</span>
              <span className="text-[15px] text-[#222222] font-normal">day</span>
            </div>
            {dateFilterActive && (
              <span className="text-[12px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/60 w-fit px-2 py-1 rounded-md">
                Available for selected dates
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
