'use client';

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearch: (term: string) => void;
}

export default function SearchBar({ searchTerm, onSearch }: SearchBarProps) {
  return (
    <div className="container-custom py-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search styles by name or category..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-2xl focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all outline-none text-gray-900 placeholder-gray-400"
        />
        {searchTerm && (
          <button
            onClick={() => onSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>
      
      {/* Quick filters */}
      <div className="flex flex-wrap gap-2 mt-4">
        <span className="text-xs text-gray-500 flex items-center">Quick filter:</span>
        {['Box Braids', 'Knotless', 'Cornrows', 'Twists', 'Dreads'].map((cat) => (
          <button
            key={cat}
            onClick={() => onSearch(cat)}
            className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-amber-100 text-gray-600 hover:text-amber-700 rounded-full transition-colors border border-transparent hover:border-amber-300"
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}