// app/components/SearchBar.tsx
'use client';

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearch: (term: string) => void;
}

export default function SearchBar({ searchTerm, onSearch }: SearchBarProps) {
  return (
    <div className="container-custom py-8">
      <div className="relative group max-w-3xl mx-auto">
        {/* Search Icon */}
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-espresso-400 group-focus-within:text-primary-500 transition-colors pointer-events-none z-10" />

        {/* Input */}
        <input
          type="text"
          placeholder="Search salons by name, town, or postcode…"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-14 pr-14 py-4 bg-white border border-espresso-200 rounded-2xl text-espresso-950 placeholder-espresso-400 shadow-[0_8px_30px_-12px_rgba(42,34,31,0.12)] focus:border-primary-400 focus:ring-4 focus:ring-primary-500/15 focus:shadow-[0_12px_40px_-12px_rgba(42,34,31,0.2)] transition-all outline-none text-base"
        />

        {/* Clear Button */}
        {searchTerm && (
          <button
            onClick={() => onSearch('')}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-espresso-100 rounded-full transition-colors z-10"
          >
            <X className="w-4 h-4 text-espresso-500" />
          </button>
        )}
      </div>
    </div>
  );
}