'use client';

import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (categoryId: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const totalCount = categories.reduce((acc, cat) => acc + (cat.count || 0), 0);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [categories.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = Math.max(200, scrollRef.current.clientWidth * 0.6);
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const pillBase =
    'flex-shrink-0 px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-200 font-medium text-sm border';
  const pillActive =
    'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-transparent shadow-md shadow-amber-600/25';
  const pillIdle =
    'bg-cream-100 text-gray-700 border-cream-200 hover:bg-cream-200 hover:border-cream-300';

  return (
    <div className="border-b border-cream-200 bg-cream-50">
      <div className="container-custom py-4">
        <div className="relative">
          {/* Fade edges on mobile for a hint that content scrolls */}
          <div
            className={`pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-[5] bg-gradient-to-r from-cream-50 to-transparent transition-opacity duration-200 ${
              canScrollLeft ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            className={`pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-[5] bg-gradient-to-l from-cream-50 to-transparent transition-opacity duration-200 ${
              canScrollRight ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Left scroll button */}
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll categories left"
            className={`absolute left-1 top-1/2 -translate-y-1/2 z-10 p-2 bg-white border border-cream-200 shadow-md rounded-full hover:bg-cream-100 hover:scale-105 active:scale-95 transition-all md:hidden ${
              canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>

          {/* Categories */}
          <div
            ref={scrollRef}
            className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide px-8 md:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <button
              onClick={() => onSelect(null)}
              className={`${pillBase} ${!selected ? pillActive : pillIdle}`}
            >
              All Styles
              <span
                className={`ml-2 text-xs ${
                  !selected ? 'text-white/85' : 'text-gray-500'
                }`}
              >
                {totalCount}
              </span>
            </button>

            {categories.map((cat) => {
              const isActive = selected === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelect(cat.id)}
                  className={`${pillBase} ${isActive ? pillActive : pillIdle}`}
                >
                  {cat.name}
                  <span
                    className={`ml-2 text-xs ${
                      isActive ? 'text-white/85' : 'text-gray-500'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right scroll button */}
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll categories right"
            className={`absolute right-1 top-1/2 -translate-y-1/2 z-10 p-2 bg-white border border-cream-200 shadow-md rounded-full hover:bg-cream-100 hover:scale-105 active:scale-95 transition-all md:hidden ${
              canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
}