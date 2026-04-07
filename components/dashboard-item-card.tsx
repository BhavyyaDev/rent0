"use client";

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Item } from './item-card';
import { Button } from './ui/button';
import { deleteItem } from '@/app/actions/item';
import { Trash2, Edit3, Loader2 } from 'lucide-react';

export function DashboardItemCard({ item }: { item: Item }) {
  const fallbackImg = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
  const [imgSrc, setImgSrc] = useState(item.imageUrl || fallbackImg);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this listing?')) {
      startTransition(async () => {
        const result = await deleteItem(item.id);
        if (result.error) {
          alert(result.error);
        }
      });
    }
  };

  return (
    <div className="group block relative bg-white rounded-[24px] border border-[#EBEBEB] p-3 transition-all hover:shadow-md">
      <div className="flex flex-col gap-3">
        {/* Image Section */}
        <div className="w-full aspect-[4/3] relative overflow-hidden rounded-[16px] bg-[#F7F7F7]">
          <img 
            src={imgSrc} 
            alt={item.title} 
            onError={() => setImgSrc(fallbackImg)}
            className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-105" 
          />
          
          {/* Action Overlay (Desktop) */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Link href={`/items/${item.id}/edit`}>
              <Button size="icon" variant="secondary" className="rounded-full shadow-lg bg-white/90 hover:bg-white text-slate-900 border-none h-10 w-10">
                <Edit3 className="w-4 h-4" />
              </Button>
            </Link>
            <Button 
              size="icon" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-full shadow-lg h-10 w-10"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col px-1 pb-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-[600] text-[16px] text-[#222222] line-clamp-1 leading-[20px]">
              {item.title}
            </h3>
          </div>
          <div className="mt-[4px] flex items-baseline">
            <span className="font-[600] text-[15px] text-[#222222]">₹{item.pricePerDay.toLocaleString()}</span>
            <span className="text-[14px] text-[#6A6A6A] ml-1">/ day</span>
          </div>
          
          {/* Mobile Actions */}
          <div className="mt-4 flex gap-2 md:hidden">
            <Link href={`/items/${item.id}/edit`} className="flex-1">
              <Button variant="outline" className="w-full rounded-xl flex items-center gap-2 h-10 text-sm font-semibold">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </Button>
            </Link>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isPending}
              className="flex-1 rounded-xl flex items-center gap-2 h-10 text-sm font-semibold"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
            </Button>
          </div>
        </div>
      </div>
      
      {/* Detail Link (Invisible layer to allow clicking for details while actions are clickable separately) */}
      <Link href={`/items/${item.id}`} className="absolute inset-0 -z-10" />
    </div>
  );
}
