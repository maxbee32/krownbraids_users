// app/components/ServiceCard.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Clock, ImageOff, Heart, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [liked, setLiked] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Filter out any images that fail to load to avoid broken states
  const [validImages, setValidImages] = useState<string[]>([]);

  useEffect(() => {
    // Resolve all images from the service
    const images = (service.serviceImages || [])
      .map((img) => resolveImageUrl(img))
      .filter(Boolean);
    setValidImages(images);
  }, [service.serviceImages]);

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
      image: validImages[0],
      price: service.amount,
      category: service.category,
      salonId,
    });

    toast.success(nowLiked ? 'Added to wishlist' : 'Removed from wishlist');
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  return (
    <div className="group bg-white rounded-2xl border border-espresso-100 overflow-hidden hover:border-primary-300 hover:shadow-[0_20px_40px_-20px_rgba(42,34,31,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      
      {/* Service Image Slider */}
      <div className="relative aspect-[4/3] bg-espresso-50 overflow-hidden">
        {validImages.length > 0 ? (
          <>
            {/* Render all images on top of each other and toggle opacity */}
            {validImages.map((src, index) => (
              <Image
                key={src}
                src={src}
                alt={`${service.name} - Image ${index + 1}`}
                fill
                className={`object-cover transition-opacity duration-300 ${
                  index === activeImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                } group-hover:scale-105 transition-transform duration-700`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
              />
            ))}

            {/* Slider Arrows (only if more than 1 image) */}
            {validImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white/80 hover:bg-white text-espresso-900 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white/80 hover:bg-white text-espresso-900 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                  {validImages.map((_, i) => (
                    <span
                      key={i}
                      className={`block h-1.5 rounded-full transition-all ${
                        i === activeImageIndex
                          ? 'w-4 bg-primary-500'
                          : 'w-1.5 bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-espresso-300 gap-2">
            <ImageOff className="w-8 h-8" />
            <span className="text-xs font-medium uppercase tracking-wider">No Image</span>
          </div>
        )}

        {/* Duration pill */}
        <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-lg bg-espresso-950/80 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-primary-400" />
          {service.durationMinutes} min
        </div>

        {/* Wishlist heart */}
        <button
          type="button"
          onClick={handleLikeClick}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 backdrop-blur-md shadow-md hover:bg-white hover:scale-110 active:scale-95 transition-all"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              liked
                ? 'fill-primary-500 text-primary-500'
                : 'text-espresso-600'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-espresso-950 text-lg truncate group-hover:text-primary-600 transition-colors">
              {service.name}
            </h3>
            {service.category && (
              <p className="text-[11px] font-semibold text-primary-600 uppercase tracking-wider mt-1">
                {service.category}
              </p>
            )}
          </div>
          <p className="text-xl font-display font-bold text-espresso-950 flex-shrink-0">
            £{service.amount}
          </p>
        </div>

        {service.description && (
          <p className="text-sm text-espresso-600 line-clamp-2 leading-relaxed mt-2 flex-1">
            {service.description}
          </p>
        )}

        {/* Terms & Conditions */}
        {service.termsAndConditions && (
          <div className="mt-4 p-3 rounded-xl bg-espresso-50 border border-espresso-100">
            <div className="flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-espresso-500">
                Service Policy
              </span>
            </div>
            <p className="text-xs text-espresso-700 leading-snug">
              {service.termsAndConditions}
            </p>
          </div>
        )}

        <div className="flex items-center justify-end pt-4 mt-auto">
          <Link
            href={bookHref}
            onClick={handleBookClick}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-espresso-950 text-white text-sm font-semibold rounded-xl hover:bg-primary-500 hover:text-espresso-950 transition-all w-full"
          >
            Book Service
          </Link>
        </div>
      </div>
    </div>
  );
}