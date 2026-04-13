"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Clock, Banknote } from 'lucide-react';

export function SortControl() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'newest';

  const setSort = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sort);
    router.push(`/explore?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-full w-fit mb-8">
      <button
        onClick={() => setSort('newest')}
        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
          currentSort === 'newest'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <Clock className="w-4 h-4" />
        Newest First
      </button>
      <button
        onClick={() => setSort('price-low')}
        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
          currentSort === 'price-low'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <Banknote className="w-4 h-4" />
        Price: Low to High
      </button>
    </div>
  );
}
