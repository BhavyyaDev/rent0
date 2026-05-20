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

  const active =
    'flex items-center space-x-2 bg-[#1a1a1a] text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg shadow-[#1a1a1a]/10';
  const inactive =
    'flex items-center space-x-2 bg-white border border-gray-200 text-gray-600 px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors';

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => setSort('newest')}
        className={currentSort === 'newest' ? active : inactive}
      >
        <Clock className="h-4 w-4" />
        <span>Newest First</span>
      </button>
      <button
        onClick={() => setSort('price-low')}
        className={currentSort === 'price-low' ? active : inactive}
      >
        <Banknote className="h-4 w-4" />
        <span>Price: Low to High</span>
      </button>
    </div>
  );
}
