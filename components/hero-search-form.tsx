"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

export function HeroSearchForm() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("q", searchTerm.trim());
    if (category !== "all") params.set("category", category);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="glass-input-container max-w-3xl mx-auto rounded-full p-2 flex flex-col md:flex-row items-center gap-2 group"
    >
      {/* Search field */}
      <div className="flex-1 w-full flex items-center px-6 gap-3 md:border-r border-gray-100">
        <Search className="w-5 h-5 text-gray-400 group-hover:text-[#65a30d] transition-colors flex-shrink-0" />
        <div className="flex flex-col items-start w-full">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
            Looking For
          </span>
          <input
            type="text"
            placeholder="What are you looking for?"
            className="border-none p-0 text-sm font-medium w-full placeholder:text-gray-300 bg-transparent outline-none py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Category field */}
      <div className="flex-1 w-full flex items-center px-6 gap-3">
        <MapPin className="w-5 h-5 text-gray-400 group-hover:text-[#65a30d] transition-colors flex-shrink-0" />
        <div className="flex flex-col items-start w-full">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
            Category
          </span>
          <select
            className="border-none p-0 text-sm font-medium w-full bg-transparent outline-none py-2 cursor-pointer"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Gear</option>
            <option value="camera">Cameras</option>
            <option value="audio">Audio</option>
            <option value="gaming">Gaming</option>
            <option value="tech">Tech</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="bg-[#1a1a1a] text-white rounded-full px-8 py-4 text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-all w-full md:w-auto justify-center group-hover:scale-105"
      >
        Search Gear <span className="text-xs">→</span>
      </button>
    </form>
  );
}
