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
  const initialStart = searchParams.get('start') || '';
  const initialEnd = searchParams.get('end') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      const currentSearch = params.get('search') || '';
      const currentStart = params.get('start') || '';
      const currentEnd = params.get('end') || '';
      
      let changed = false;

      // Check search parameter
      if (searchTerm !== currentSearch) {
        if (searchTerm) params.set('search', searchTerm);
        else params.delete('search');
        changed = true;
      }

      // Check start date parameter
      if (startDate !== currentStart) {
        if (startDate) params.set('start', startDate);
        else params.delete('start');
        changed = true;
      }

      // Check end date parameter
      if (endDate !== currentEnd) {
        if (endDate) params.set('end', endDate);
        else params.delete('end');
        changed = true;
      }
      
      if (changed) {
        // Automatically route users executing global searches to the unified /search endpoint
        const targetPath = pathname === '/' ? '/search' : pathname.replace('/explore', '/search');
        
        if (pathname === '/') {
           router.push(`${targetPath}?${params.toString()}`, { scroll: false });
        } else {
           router.replace(`${targetPath}?${params.toString()}`, { scroll: false });
        }
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchTerm, startDate, endDate, pathname, router, searchParams]);

  // Today's date for limiting past bookings
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="relative w-full max-w-4xl mx-auto mb-10 mt-2 flex flex-col md:flex-row gap-4">
      {/* Search Input Box */}
      <div className="relative flex-1">
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

      {/* Date Filters Container */}
      <div className="flex bg-white rounded-full border border-slate-200 shadow-sm px-6 items-center focus-within:ring-2 focus-within:ring-slate-900">
         <span className="text-slate-400 uppercase text-[11px] font-extrabold mr-2 tracking-wider">Start</span>
         <input 
           type="date"
           value={startDate}
           onChange={(e) => setStartDate(e.target.value)}
           min={today}
           className="bg-transparent border-none outline-none text-slate-700 py-4 cursor-pointer font-medium text-sm"
         />
         
         <div className="w-px h-5 bg-slate-200 mx-4" />
         
         <span className="text-slate-400 uppercase text-[11px] font-extrabold mr-2 tracking-wider">End</span>
         <input 
           type="date"
           value={endDate}
           onChange={(e) => setEndDate(e.target.value)}
           min={startDate || today}
           className="bg-transparent border-none outline-none text-slate-700 py-4 cursor-pointer font-medium text-sm"
         />
      </div>
    </div>
  );
}
