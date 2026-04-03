"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Item } from '@prisma/client';

export function ItemCard({ item }: { item: Item }) {
  const fallbackImg = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
  const [imgSrc, setImgSrc] = useState(item.imageUrl || fallbackImg);

  return (
    <Link href={`/items/${item.id}`} className="group block focus:outline-none cursor-pointer">
      <div className="flex flex-col gap-3">
        {/* Image Section */}
        <div className="w-full aspect-[4/3] sm:aspect-square relative overflow-hidden rounded-[12px] bg-[#EBEBEB]">
          <img 
            src={imgSrc} 
            alt={item.title} 
            onError={() => setImgSrc(fallbackImg)}
            className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-105" 
          />
        </div>

        {/* Content Section */}
        <div className="flex flex-col px-0.5">
          <h3 className="font-[600] text-[16px] text-[#222222] line-clamp-1 leading-[20px]">
            {item.title}
          </h3>
          <p className="text-[15px] mt-[2px] text-[#6A6A6A] line-clamp-1 leading-[19px]">
            {item.description}
          </p>
          <div className="mt-[6px] flex items-baseline">
            <span className="font-[600] text-[16px] text-[#222222]">₹{item.pricePerDay.toLocaleString()}</span>
            <span className="text-[15px] text-[#222222] ml-1">/ day</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
