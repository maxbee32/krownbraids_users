// app/components/ServiceCard.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Clock, ImageOff, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { Service } from '../../lib/types';
import { resolveImageUrl } from '../../lib/imageUrl';
import {
  isInWishlist,
  toggleWishlist,
  subscribeWishlist,
} from '../../lib/wishlist';

interface ServiceCardProps {
  service: Service;
  salonId: number;
}

export default function ServiceCard({ service, salonId }: ServiceCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [liked, setLiked] = useState(false);

  const imageSrc = resolveImageUrl(service.serviceImages?.[0]);
  const showImage = Boolean(imageSrc) && !imageError;

  const bookHref = `/book?salonId=${salonId}&serviceId=${service.id}`;

  // Sync liked state from the shared wishlist
  useEffect(() => {
    const sync = () => setLiked(isInWishlist(String(service.id)));
    sync();
    return subscribeWishlist(sync);
  }, [service.id]);

  const handleBookClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('authToken')
        : null;

    if (!token) {
      e.preventDefault();
      // reason=book triggers the contextual banner on the login page.
      // No toast here — the login banner is the message.
      router.push(
        `/login?redirect=${encodeURIComponent(bookHref)}&reason=book`
      );
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nowLiked = toggleWishlist({
      id: String(service.id),
      type: 'service',
      name: service.name,
      image: imageSrc,
      price: service.amount,
      category: service.category,
      salonId,
    });

    toast.success(nowLiked ? 'Added to wishlist' : 'Removed from wishlist');
  };

  return (
    <div className="group bg-white rounded-2xl border border-cream-200 overflow-hidden hover:border-plum-200 hover:shadow-[0_20px_40px_-20px_rgba(122,38,65,0.22)] transition-all duration-300">
      {/* Service image */}
      <div className="relative h-48 sm:h-52 bg-gradient-to-br from-rose-brand-100 via-plum-100 to-plum-200 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.22] mix-blend-soft-light pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #7a2641 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        />

        {showImage ? (
          <Image
            src={imageSrc}
            alt={service.name}
            fill
            className="object-contain p-2 group-hover:scale-[1.03] transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageOff className="w-8 h-8 text-plum-300" />
          </div>
        )}

        {/* Duration pill on image (left) */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-plum-900/60 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {service.durationMinutes} min
        </div>

        {/* Wishlist heart (right) */}
        <button
          type="button"
          onClick={handleLikeClick}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white hover:scale-110 active:scale-95 transition-all"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              liked
                ? 'fill-rose-brand-600 text-rose-brand-600'
                : 'text-ink-600'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-ink-900 text-base truncate group-hover:text-plum-700 transition-colors">
              {service.name}
            </h3>
            {service.category && (
              <p className="text-xs text-ink-500 mt-0.5">{service.category}</p>
            )}
          </div>
          <p className="text-lg font-display font-bold text-plum-700 flex-shrink-0">
            £{service.amount}
          </p>
        </div>

        {service.description && (
          <p className="text-xs text-ink-600 line-clamp-2 leading-relaxed mb-4">
            {service.description}
          </p>
        )}

        <div className="flex items-center justify-end pt-4 border-t border-cream-200">
          <Link
            href={bookHref}
            onClick={handleBookClick}
            className="px-4 py-2 bg-plum-700 text-white text-sm font-semibold rounded-xl hover:bg-plum-800 hover:-translate-y-px active:translate-y-0 transition-all"
          >
            Book
          </Link>
        </div>
      </div>
    </div>
  );
}