"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

export function HeroSearchForm() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchTerm.trim()) params.set("q", searchTerm.trim());
    if (location.trim()) params.set("location", location.trim());
    if (category !== "all") params.set("category", category);
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className="flex flex-col md:flex-row items-center gap-4 bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-md relative z-20 max-w-4xl mx-auto"
    >
      <div className="flex-1 w-full flex items-center gap-4 py-3 px-6 rounded-xl bg-slate-50/50 border border-slate-100 group transition-all hover:bg-white hover:border-slate-200">
        <Search className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
        <div className="flex flex-col text-left">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Search</label>
          <input 
            type="text" 
            placeholder="What are you looking for?" 
            className="bg-transparent border-none outline-none font-black text-slate-900 placeholder:text-slate-400 w-full text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 w-full flex items-center gap-4 py-3 px-6 rounded-xl bg-slate-50/50 border border-slate-100 group transition-all hover:bg-white hover:border-slate-200">
        <MapPin className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
        <div className="flex flex-col text-left">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</label>
          <select 
            className="bg-transparent border-none outline-none font-black text-slate-900 w-full text-lg appearance-none cursor-pointer"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Gear</option>
            <option value="camera">Camera</option>
            <option value="audio">Audio</option>
            <option value="gaming">Gaming</option>
            <option value="tech">Tech</option>
          </select>
        </div>
      </div>

      <button 
        type="submit"
        className="w-full md:w-auto px-10 h-16 bg-slate-950 text-white font-black text-lg rounded-full hover:bg-black transition-all duration-200 ease-in-out shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
      >
        <span>Search Gear</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </form>
  );
}
