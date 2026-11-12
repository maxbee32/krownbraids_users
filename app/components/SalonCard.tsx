// app/components/SalonCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Check, ArrowRight } from 'lucide-react';
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
      className="group block bg-white rounded-2xl border border-espresso-100 overflow-hidden hover:border-primary-300 hover:shadow-[0_20px_40px_-20px_rgba(42,34,31,0.15)] hover:-translate-y-1 transition-all duration-300"
    >
      {/* ─── Cover Image ─── */}
      <div className="relative aspect-[4/3] bg-espresso-100 overflow-hidden">
        {coverSrc ? (
          <>
            <Image
              src={coverSrc}
              alt={`${salon.name} cover`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
            />
            {/* Dark gradient at the bottom so white text is readable */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-espresso-50">
            <span className="text-6xl font-display font-bold text-espresso-200">
              {initial}
            </span>
          </div>
        )}

        {/* ─── Top Badges (Verified) ─── */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
          <Check className="w-3.5 h-3.5 text-primary-600" strokeWidth={3} />
          <span className="text-[10px] font-bold text-espresso-950 uppercase tracking-wider">
            Verified
          </span>
        </div>

        {/* ─── Bottom Overlay: Salon Name ─── */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <h3 className="text-xl font-display font-bold text-white drop-shadow-md truncate">
            {salon.name}
          </h3>
          {location && (
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
              <p className="text-sm font-medium text-white/90 truncate drop-shadow-sm">
                {location}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="p-5 relative">
        {/* Logo Badge — overlapping the image and card edge */}
        <div className="absolute -top-7 right-5 z-20">
          {logoSrc ? (
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white shadow-xl ring-4 ring-white">
              <Image
                src={logoSrc}
                alt={`${salon.name} logo`}
                fill
                className="object-cover"
                sizes="56px"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-espresso-950 shadow-xl ring-4 ring-white flex items-center justify-center">
              <span className="text-xl font-display font-bold text-primary-500">
                {initial}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="pr-16 mt-1">
          {salon.description ? (
            <p className="text-sm text-espresso-600 line-clamp-2 leading-relaxed min-h-[40px]">
              {salon.description}
            </p>
          ) : (
            <p className="text-sm text-espresso-400 italic leading-relaxed min-h-[40px]">
              Discover premium braiding services at this location.
            </p>
          )}
        </div>

        {/* Footer link */}
        <div className="mt-5 pt-4 border-t border-espresso-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-espresso-950 group-hover:text-primary-600 transition-colors">
            View services
          </span>
          <span className="w-8 h-8 rounded-full bg-espresso-50 border border-espresso-100 flex items-center justify-center group-hover:bg-primary-500 group-hover:border-primary-500 transition-all duration-300">
            <ArrowRight className="w-4 h-4 text-espresso-600 group-hover:text-espresso-950 group-hover:translate-x-0.5 transition-all" />
          </span>
        </div>
      </div>
    </Link>
  );
}