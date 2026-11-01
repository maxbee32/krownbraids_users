// app/components/SalonCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight } from 'lucide-react';
import { Salon } from '../../lib/types';
import { resolveImageUrl } from '../../lib/imageUrl';

interface SalonCardProps {
  salon: Salon;
}

export default function SalonCard({ salon }: SalonCardProps) {
  const initial = salon.name?.charAt(0).toUpperCase() ?? 'K';
  const location = [salon.city?.trim(), salon.country?.trim()]
    .filter(Boolean)
    .join(', ');

  const coverSrc = resolveImageUrl(salon.coverImageUrl);
  const logoSrc = resolveImageUrl(salon.logoUrl);

  return (
    <Link
      href={`/salons/${salon.id}`}
      className="group block bg-white rounded-2xl border border-cream-200 overflow-hidden hover:border-plum-200 hover:shadow-[0_20px_40px_-20px_rgba(122,38,65,0.22)] hover:-translate-y-1 transition-all duration-300"
    >
      {/* ─── Header / cover ─── */}
      <div className="relative h-40 bg-gradient-to-br from-rose-brand-100 via-plum-100 to-plum-200 overflow-hidden">
        {coverSrc ? (
          <>
            <Image
              src={coverSrc}
              alt={`${salon.name} cover`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized // remove in production (ngrok free-tier workaround)
            />
            {/* Subtle fade so logo/text stays readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-plum-900/30 via-transparent to-transparent pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-7xl font-display font-bold text-plum-700/30 group-hover:text-plum-700/45 transition-colors duration-300 select-none">
                {initial}
              </span>
            </div>

            {/* Subtle plum dot pattern */}
            <div
              className="absolute inset-0 opacity-[0.10] mix-blend-soft-light pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, #7a2641 1px, transparent 0)',
                backgroundSize: '16px 16px',
              }}
            />

            {/* Bottom fade for depth */}
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-plum-200/40 to-transparent pointer-events-none" />
          </>
        )}

        {/* ─── Logo badge ─── */}
        <div className="absolute bottom-3 left-3 z-10">
          {logoSrc ? (
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white shadow-lg ring-2 ring-white">
              <Image
                src={logoSrc}
                alt={`${salon.name} logo`}
                fill
                className="object-cover"
                sizes="48px"
                unoptimized // remove in production
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-white shadow-lg ring-2 ring-white flex items-center justify-center">
              <span className="text-lg font-display font-bold text-plum-700">
                {initial}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="p-5">
        <h3 className="text-lg font-display font-semibold text-ink-900 group-hover:text-plum-700 transition-colors truncate">
          {salon.name}
        </h3>

        {location && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <MapPin className="w-3.5 h-3.5 text-plum-400 flex-shrink-0" />
            <p className="text-sm text-ink-500 truncate">{location}</p>
          </div>
        )}

        {salon.description && (
          <p className="text-xs text-ink-600 mt-3 line-clamp-2 leading-relaxed">
            {salon.description}
          </p>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-cream-200 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-800 group-hover:text-plum-700 transition-colors">
            View services
          </span>
          <span className="w-7 h-7 rounded-full bg-plum-50 border border-plum-100 flex items-center justify-center group-hover:bg-plum-700 group-hover:border-plum-700 transition-all">
            <ArrowRight className="w-3.5 h-3.5 text-plum-700 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </span>
        </div>
      </div>
    </Link>
  );
}