'use client';

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearch: (term: string) => void;
}

const QUICK_FILTERS = [
  'Box braids',
  'Knotless',
  'Cornrows',
  'Twists',
  'Dreads',
];

export default function SearchBar({ searchTerm, onSearch }: SearchBarProps) {
  const isFilterActive = (cat: string) =>
    searchTerm.toLowerCase() === cat.toLowerCase();

  return (
    <div className="container-custom py-5">
      {/* Search input */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400 group-focus-within:text-plum-700 transition-colors pointer-events-none" />

        <input
          type="text"
          placeholder="Search salons by name, town, or postcode…"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-12 pr-12 py-3.5 bg-white border border-cream-200 rounded-2xl text-ink-900 placeholder-ink-400 shadow-sm focus:border-plum-300 focus:ring-4 focus:ring-plum-100 focus:shadow-md transition-all outline-none text-sm"
        />

        {searchTerm && (
          <button
            onClick={() => onSearch('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-plum-50 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-ink-500" />
          </button>
        )}
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <span className="text-xs font-medium text-ink-500 mr-1">
          Popular:
        </span>

        {QUICK_FILTERS.map((cat) => {
          const active = isFilterActive(cat);
          return (
            <button
              key={cat}
              onClick={() => onSearch(active ? '' : cat)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all border ${
                active
                  ? 'bg-plum-700 text-white border-plum-700 shadow-sm shadow-plum-700/20'
                  : 'bg-plum-50 text-plum-700 border-plum-100 hover:bg-plum-100 hover:text-plum-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}