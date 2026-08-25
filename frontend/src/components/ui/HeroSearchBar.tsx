"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HeroSearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push("/services?category=" + encodeURIComponent(query.trim()));
    }
  };

  return (
    <form onSubmit={handleSearch} className="max-w-3xl mx-auto bg-white p-2 rounded-2xl flex items-center shadow-2xl relative z-20 transition-transform focus-within:scale-[1.02]">
      <div className="pl-4 pr-2">
        <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for wedding shoots, podcasts, or drone videography..." 
        className="w-full py-3 bg-transparent border-none text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 text-base md:text-lg"
      />
      <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
        Search
      </button>
    </form>
  );
}
