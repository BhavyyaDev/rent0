"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "./ui/button";

export function HeroSearchForm() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }
    
    // Explicit SPA client-side push to search
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-[32px] shadow-2xl shadow-slate-200 border border-slate-100 p-2 md:p-3 flex items-center gap-2">
      <div className="flex-1 flex items-center px-6 gap-4">
        <Search className="w-6 h-6 text-slate-400 shrink-0" />
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="What are you looking for?" 
          className="w-full h-14 outline-none text-slate-900 text-lg font-bold placeholder:text-slate-400 bg-transparent"
        />
      </div>
      <Button type="submit" className="rounded-full h-14 px-10 bg-slate-900 text-white hover:bg-slate-800 text-lg font-bold transition-all active:scale-95 shadow-lg shadow-slate-200">
        Search
      </Button>
    </form>
  );
}
