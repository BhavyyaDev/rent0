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
    <div className="group block relative bg-white rounded-[28px] border border-slate-100 p-2.5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex flex-col gap-3">
        {/* Image Section */}
        <div className="w-full aspect-[4/3] relative overflow-hidden rounded-[20px] bg-[#F7F7F7]">
          <img 
            src={imgSrc} 
            alt={item.title} 
            onError={() => setImgSrc(fallbackImg)}
            className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-110" 
          />
          
          {/* Action Overlay (Desktop) */}
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 active:scale-95 duration-200">
            <Link href={`/items/${item.id}/edit`}>
              <Button size="icon" variant="secondary" className="rounded-full shadow-2xl bg-white/95 hover:bg-white text-slate-900 border-none h-11 w-11 transition-all hover:scale-110">
                <Edit3 className="w-5 h-5" />
              </Button>
            </Link>
            <Button 
              size="icon" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-full shadow-2xl h-11 w-11 transition-all hover:scale-110"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col px-2 pb-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-[600] text-[16px] text-[#222222] line-clamp-1 leading-[20px]">
              {item.title}
            </h3>
          </div>
          <p className="text-[14px] mt-[4px] text-[#717171] line-clamp-1 font-medium italic">
            Management View
          </p>
          <div className="mt-[8px] flex items-baseline gap-1">
            <span className="font-[600] text-[16px] text-[#222222]">₹{item.pricePerDay.toLocaleString()}</span>
            <span className="text-[14px] text-[#717171] font-medium">day</span>
          </div>
          
          {/* Mobile Actions */}
          <div className="mt-5 flex gap-2 md:hidden">
            <Link href={`/items/${item.id}/edit`} className="flex-1">
              <Button variant="outline" className="w-full rounded-2xl flex items-center gap-2 h-11 text-sm font-bold border-slate-200">
                <Edit3 className="w-4 h-4" /> Edit
              </Button>
            </Link>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isPending}
              className="flex-1 rounded-2xl flex items-center gap-2 h-11 text-sm font-bold shadow-sm"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
