// app/components/SalonCard.tsx
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { Salon } from '../../lib/types';

interface SalonCardProps {
  salon: Salon;
}

export default function SalonCard({ salon }: SalonCardProps) {
  const initial = salon.name?.charAt(0).toUpperCase() ?? 'K';
  const location = [salon.city, salon.country].filter(Boolean).join(', ');

  return (
    <Link
      href={`/salons/${salon.id}`}
      className="group block bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-stone-300 hover:shadow-[0_20px_40px_-20px_rgba(28,25,23,0.15)] hover:-translate-y-1 transition-all duration-300"
    >
      {/* Header with initial */}
      <div className="relative h-40 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center overflow-hidden">
        <span className="text-6xl font-display font-bold text-ink-900/25 select-none">
          {initial}
        </span>

        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #1c1917 1px, transparent 0)',
            backgroundSize: '16px 16px',
          }}
        />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-display font-semibold text-ink-900 group-hover:text-ink-700 transition-colors truncate">
          {salon.name}
        </h3>

        {location && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
            <p className="text-sm text-stone-600 truncate">{location}</p>
          </div>
        )}

        {salon.description && (
          <p className="text-xs text-stone-600 mt-3 line-clamp-2 leading-relaxed">
            {salon.description}
          </p>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-stone-200 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-800">
            View services
          </span>
          <span className="w-7 h-7 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center group-hover:bg-ink-900 group-hover:border-ink-900 transition-all">
            <ArrowRight className="w-3.5 h-3.5 text-ink-800 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </span>
        </div>
      </div>
    </Link>
  );
}