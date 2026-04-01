'use client';

import { Camera, Speaker, Gamepad2, Laptop, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const CATEGORIES = [
  { name: 'All Items', icon: Sparkles, value: '' },
  { name: 'Cameras', icon: Camera, value: 'camera' },
  { name: 'Speakers', icon: Speaker, value: 'speaker' },
  { name: 'Gaming', icon: Gamepad2, value: 'gaming' },
  { name: 'Laptops', icon: Laptop, value: 'laptop' },
];

function CategoryList() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || '';

  return (
    <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar scroll-smooth">
      {CATEGORIES.map((cat) => {
        const isSelected = currentCategory === cat.value;
        return (
          <Link
            key={cat.name}
            href={cat.value ? `/?category=${cat.value}` : '/'}
            className={`flex-shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-full border shadow-sm font-semibold transition-all active:scale-95 duration-200 outline-none ${
              isSelected
                ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <cat.icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className="text-sm">{cat.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function CategoryBar() {
  return (
    <div className="mb-10 w-full relative">
      {/* Soft gradient edges for mobile scrolling hint -- optional but premium */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#F8FAFC] to-transparent sm:hidden z-10 pointer-events-none" />
      <Suspense fallback={<div className="h-[46px]" />}>
        <CategoryList />
      </Suspense>
    </div>
  );
}
