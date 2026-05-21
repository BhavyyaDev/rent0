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
    <div className="product-card-hover rounded-3xl p-4 group block relative">
      <div className="flex flex-col gap-4">
        {/* Image Section */}
        <div className="w-full aspect-[4/3] relative overflow-hidden rounded-2xl bg-gray-100">
          <img
            src={imgSrc}
            alt={item.title}
            onError={() => setImgSrc(fallbackImg)}
            className="object-cover w-full h-full transition-transform duration-1000 ease-out group-hover:scale-110"
          />

          {/* Action Overlay (Desktop) */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 duration-300">
            <Link href={`/items/${item.id}/edit`}>
              <Button size="icon" variant="secondary" className="rounded-full shadow-md bg-white/95 hover:bg-white text-[#1a1a1a] border-none h-12 w-12 transition-all hover:scale-110">
                <Edit3 className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              size="icon"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-full shadow-md h-12 w-12 transition-all hover:scale-110 bg-red-500 hover:bg-red-600 border-none"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col px-1 pb-2">
          <h3 className="font-black text-[17px] text-[#1a1c1c] line-clamp-1 tracking-tight leading-tight">
            {item.title}
          </h3>
          <p className="text-[11px] mt-1.5 text-gray-400 font-bold uppercase tracking-widest">
            {item.category ?? 'Equipment'}
          </p>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="font-black text-[18px] text-[#1a1c1c] tracking-tighter">₹{item.pricePerDay.toLocaleString()}</span>
            <span className="text-[12px] text-gray-400 font-bold uppercase tracking-widest">/ day</span>
          </div>

          {/* Mobile Actions */}
          <div className="mt-5 flex gap-3 md:hidden">
            <Link href={`/items/${item.id}/edit`} className="flex-1 text-left">
              <Button variant="outline" className="w-full rounded-full flex items-center gap-2 h-10 text-sm font-bold border-gray-200 text-gray-700 bg-white hover:bg-gray-50">
                <Edit3 className="w-4 h-4" /> Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              className="flex-1 rounded-full flex items-center gap-2 h-10 text-sm font-bold shadow-md bg-red-500 hover:bg-red-600"
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
