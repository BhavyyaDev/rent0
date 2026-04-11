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
import { X, SlidersHorizontal, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function SearchFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initial states from URL
  const initialSort = searchParams.get('sort') || 'newest';
  const initialMinPrice = parseInt(searchParams.get('minPrice') || '0');
  const initialMaxPrice = parseInt(searchParams.get('maxPrice') || '2000');
  const initialStart = searchParams.get('startDate');
  const initialEnd = searchParams.get('endDate');

  const [sort, setSort] = useState(initialSort);
  const [priceRange, setPriceRange] = useState([initialMinPrice, initialMaxPrice]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialStart && initialEnd ? { from: new Date(initialStart), to: new Date(initialEnd) } : undefined
  );
  const [isChanging, setIsChanging] = useState(false);

  // Sync with URL changes
  useEffect(() => {
    setSort(searchParams.get('sort') || 'newest');
    setPriceRange([
      parseInt(searchParams.get('minPrice') || '0'),
      parseInt(searchParams.get('maxPrice') || '2000')
    ]);
    const s = searchParams.get('startDate');
    const e = searchParams.get('endDate');
    if (s && e) {
      setDateRange({ from: new Date(s), to: new Date(e) });
    } else {
      setDateRange(undefined);
    }
  }, [searchParams]);

  const updateFilters = useCallback((newSort: string, newRange: number[], newDates: DateRange | undefined) => {
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

    if (newDates?.from && newDates?.to) {
      params.set('startDate', newDates.from.toISOString());
      params.set('endDate', newDates.to.toISOString());
    } else {
      params.delete('startDate');
      params.delete('endDate');
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // Debounced update for slider
  useEffect(() => {
    if (!isChanging) return;
    const timer = setTimeout(() => {
      updateFilters(sort, priceRange, dateRange);
      setIsChanging(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [priceRange, sort, dateRange, updateFilters, isChanging]);

  const handleSortChange = (value: string) => {
    setSort(value);
    updateFilters(value, priceRange, dateRange);
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    setIsChanging(true);
  };

  const handleDateChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange);
    updateFilters(sort, priceRange, newRange);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('sort');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('startDate');
    params.delete('endDate');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const hasActiveFilters = sort !== 'newest' || priceRange[0] !== 0 || priceRange[1] !== 2000 || !!dateRange;

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
          {/* Date Range Picker */}
          <div className="flex flex-col gap-2 min-w-[200px]">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Dates</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-bold rounded-xl border-slate-200 bg-slate-50/50 h-10 px-3",
                    !dateRange && "text-slate-400 font-medium"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd")} -{" "}
                        {format(dateRange.to, "LLL dd")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd")
                    )
                  ) : (
                    <span>Pick a range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl border-slate-100" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="h-10 w-px bg-slate-100 hidden lg:block" />

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
