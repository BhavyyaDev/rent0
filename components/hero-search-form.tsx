"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar } from "lucide-react";
import { Button } from "./ui/button";

export function HeroSearchForm() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }
    if (startDate) {
      params.set("start", startDate);
    }
    if (endDate) {
      params.set("end", endDate);
    }
    
    // Explicit SPA client-side push to search
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white rounded-[32px] shadow-2xl shadow-slate-200 border border-slate-100 p-2 md:p-3 flex flex-col md:flex-row items-center gap-2">
      <div className="flex-1 w-full flex items-center px-4 gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="What are you looking for?" 
          className="w-full h-12 outline-none text-slate-800 font-medium placeholder:text-slate-400 bg-transparent"
        />
      </div>
      <div className="hidden md:block w-px h-8 bg-slate-100 mx-2" />
      <div className="flex-1 w-full flex items-center px-4 gap-2">
        <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
        <input 
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full bg-transparent text-slate-600 font-medium outline-none text-[15px] cursor-pointer"
          min={new Date().toISOString().split('T')[0]}
          aria-label="Start date"
        />
        <span className="text-slate-300">-</span>
        <input 
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full bg-transparent text-slate-600 font-medium outline-none text-[15px] cursor-pointer"
          min={startDate || new Date().toISOString().split('T')[0]}
          aria-label="End date"
        />
      </div>
      <Button type="submit" className="w-full md:w-auto rounded-full h-14 px-8 bg-slate-900 text-white hover:bg-slate-800 text-lg font-bold transition-all active:scale-95">
        Search
      </Button>
    </form>
  );
}
