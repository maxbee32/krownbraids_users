'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';

interface FeaturedService {
  id: string;
  name: string;
  amount: number;
  durationMinutes: number;
  serviceImages: string[];
  salonId: number;
  salonName: string;
  salonCity?: string;
}

export default function FeaturedServices() {
  const [services, setServices] = useState<FeaturedService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/featured-services', {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        setServices(data.services ?? []);
      } catch (err) {
        console.error('Failed to load featured services:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || services.length === 0) return null;

  return (
    <section className="bg-white border-b border-stone-200">
      <div className="container-custom py-12 sm:py-16">
        {/* Section header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-amber-700 uppercase mb-2">
              Trending
            </p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-ink-900">
              Styles to try
            </h2>
            <p className="text-sm text-stone-600 mt-2">
              Fresh work from salons around the UK
            </p>
          </div>

          <Link
            href="/salons"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-ink-700 hover:text-ink-900 transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Horizontal scroll strip */}
        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/salons/${service.salonId}`}
                className="group flex-shrink-0 w-56 sm:w-64 snap-start"
              >
                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-stone-300 hover:shadow-[0_20px_40px_-20px_rgba(28,25,23,0.15)] transition-all duration-300">
                  {/* Image */}
                  <div className="relative h-72 bg-stone-100 overflow-hidden">
                    <Image
                      src={service.serviceImages[0]}
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 224px, 256px"
                      unoptimized={
                        service.serviceImages[0].startsWith('http') ||
                        service.serviceImages[0].includes('ngrok')
                      }
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-ink-900 text-sm truncate">
                      {service.name}
                    </h3>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <MapPin className="w-3 h-3 text-stone-400 flex-shrink-0" />
                      <p className="text-xs text-stone-600 truncate">
                        {service.salonName}
                        {service.salonCity ? ` · ${service.salonCity}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <p className="text-base font-display font-bold text-ink-900">
                        £{service.amount}
                      </p>
                      <span className="text-xs text-stone-500">
                        {service.durationMinutes} min
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}