"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "./ui/button";

export function SearchFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initial states from URL
  const initialSort = searchParams.get('sort') || 'newest';
  const initialMinPrice = parseInt(searchParams.get('minPrice') || '0');
  const initialMaxPrice = parseInt(searchParams.get('maxPrice') || '2000');

  const [sort, setSort] = useState(initialSort);
  const [priceRange, setPriceRange] = useState([initialMinPrice, initialMaxPrice]);
  const [isChanging, setIsChanging] = useState(false);

  // Sync with URL changes (e.g. when filters are cleared)
  useEffect(() => {
    setSort(searchParams.get('sort') || 'newest');
    setPriceRange([
      parseInt(searchParams.get('minPrice') || '0'),
      parseInt(searchParams.get('maxPrice') || '2000')
    ]);
  }, [searchParams]);

  const updateFilters = useCallback((newSort: string, newRange: number[]) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Maintain the search text if it exists
    const q = searchParams.get('q');
    if (q) params.set('q', q);
    
    if (newSort === 'newest') params.delete('sort');
    else params.set('sort', newSort);
    
    if (newRange[0] === 0) params.delete('minPrice');
    else params.set('minPrice', newRange[0].toString());
    
    if (newRange[1] === 2000) params.delete('maxPrice');
    else params.set('maxPrice', newRange[1].toString());

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // Debounced update for slider
  useEffect(() => {
    if (!isChanging) return;
    const timer = setTimeout(() => {
      updateFilters(sort, priceRange);
      setIsChanging(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [priceRange, sort, updateFilters, isChanging]);

  const handleSortChange = (value: string) => {
    setSort(value);
    updateFilters(value, priceRange);
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    setIsChanging(true);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('sort');
    params.delete('minPrice');
    params.delete('maxPrice');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const hasActiveFilters = sort !== 'newest' || priceRange[0] !== 0 || priceRange[1] !== 2000;

  return (
    <div className="flex flex-col gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-slate-900" />
          <h3 className="font-extrabold text-slate-900">Filters</h3>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="h-7 px-2 text-xs font-bold text-slate-500 hover:text-slate-900 ml-2 rounded-full"
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {/* Price Range Slider */}
          <div className="flex flex-col gap-3 min-w-[240px]">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Price Range (Day)</Label>
              <span className="text-xs font-bold text-slate-900">₹{priceRange[0]} - ₹{priceRange[1]}+</span>
            </div>
            <Slider
              value={priceRange}
              onValueChange={handlePriceChange}
              max={2000}
              step={50}
              className="mt-1"
            />
          </div>

          <div className="h-10 w-px bg-slate-100 hidden md:block" />

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Sort By</Label>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px] rounded-xl border-slate-200 font-bold bg-slate-50/50">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
