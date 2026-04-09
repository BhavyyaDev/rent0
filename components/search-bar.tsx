"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';

export function SearchBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      const currentSearch = params.get('search') || '';
      
      // Update only if actual string value differs
      if (searchTerm !== currentSearch) {
        if (searchTerm) {
          params.set('search', searchTerm);
        } else {
          params.delete('search');
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchTerm, pathname, router, searchParams]);

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-10 mt-2">
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
        <Search className="h-[22px] w-[22px] text-slate-400" />
      </div>
      <Input
        type="text"
        placeholder="Refine your search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-14 pr-6 py-7 rounded-full border-slate-200 shadow-sm focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:border-transparent bg-white text-[17px] font-medium"
      />
    </div>
  );
}
