// app/components/ServiceCard.tsx
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Service } from '../../lib/types';

interface ServiceCardProps {
  service: Service;
  salonId: number;
}

export default function ServiceCard({ service, salonId }: ServiceCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-stone-200 p-5 hover:border-stone-300 hover:shadow-[0_20px_40px_-20px_rgba(28,25,23,0.15)] transition-all duration-300">
      {/* Header — name and price */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-ink-900 text-base truncate">
            {service.name}
          </h3>
          {service.category && (
            <p className="text-xs text-stone-600 mt-0.5">
              {service.category}
            </p>
          )}
        </div>
        <p className="text-lg font-display font-bold text-ink-900 flex-shrink-0">
          £{service.amount}
        </p>
      </div>

      {service.description && (
        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
          {service.description}
        </p>
      )}

      {/* Footer — duration and book button */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-200">
        <span className="text-xs text-stone-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {service.durationMinutes} min
        </span>

        <Link
          href={`/book?salonId=${salonId}&serviceId=${service.id}`}
          className="px-4 py-2 bg-ink-900 text-white text-sm font-semibold rounded-xl hover:bg-ink-800 hover:-translate-y-px active:translate-y-0 transition-all"
        >
          Book
        </Link>
      </div>
    </div>
  );
}