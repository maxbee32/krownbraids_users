'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Heart,
  Clock,
  Star,
  Sparkles,
  Calendar,
  Brain,
  ImageOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import BookingModal from './BookingModal';
import AITryOn from './AITryOn';
import { Style } from '../types';
import { resolveImageUrl } from '../../lib/imageUrl';
import {
  isInWishlist,
  toggleWishlist,
  subscribeWishlist,
} from '../../lib/wishlist';

interface StyleCardProps {
  style: Style;
}

export default function StyleCard({ style }: StyleCardProps) {
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [showBooking, setShowBooking] = useState<boolean>(false);
  const [showAITryOn, setShowAITryOn] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  const imageSrc = resolveImageUrl(style.image);

  // Sync liked state from the shared wishlist store
  useEffect(() => {
    const sync = () => setIsLiked(isInWishlist(String(style.id)));
    sync();
    return subscribeWishlist(sync);
  }, [style.id]);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nowLiked = toggleWishlist({
      id: String(style.id),
      type: 'style',
      name: style.name,
      image: imageSrc,
      price: style.price,
      category: style.category,
    });

    toast.success(nowLiked ? 'Added to wishlist' : 'Removed from wishlist');
  };

  const getLengthStyle = (length: string): string => {
    const styles: Record<string, string> = {
      Short: 'bg-sky-100 text-sky-800 ring-1 ring-sky-200',
      Medium: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
      Long: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
      'Extra Long':
        'bg-rose-brand-100 text-rose-brand-800 ring-1 ring-rose-brand-200',
    };
    return (
      styles[length] || 'bg-plum-50 text-plum-700 ring-1 ring-plum-100'
    );
  };

  return (
    <>
      <div className="group relative bg-white rounded-3xl border border-cream-200 overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(122,38,65,0.22)] hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-72 sm:h-80 md:h-96 bg-gradient-to-br from-rose-brand-100 via-plum-100 to-plum-200 overflow-hidden">
          {!imageError && imageSrc ? (
            <Image
              src={imageSrc}
              alt={style.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={style.id <= 4}
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-rose-brand-100 via-plum-100 to-plum-200 text-plum-400">
              <ImageOff className="w-10 h-10" />
              <span className="text-xs font-medium tracking-wide uppercase">
                No image
              </span>
            </div>
          )}

          {/* Gradient scrim at bottom for better button contrast */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-plum-900/45 via-plum-900/15 to-transparent pointer-events-none" />

          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${getLengthStyle(
                style.length
              )}`}
            >
              {style.length}
            </span>
            {style.isNew && (
              <span className="px-3 py-1.5 bg-plum-700 text-white text-xs font-bold rounded-full shadow-sm shadow-plum-800/30">
                NEW
              </span>
            )}
          </div>

          {/* Trending badge */}
          {style.isTrending && (
            <div className="absolute top-3 right-3 px-3 py-1.5 bg-rose-brand-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg shadow-rose-brand-600/30">
              <Sparkles className="w-3 h-3 animate-pulse" />
              TRENDING
            </div>
          )}

          {/* Like button — persists to shared wishlist */}
          <button
            onClick={handleLikeClick}
            aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-1/2 right-4 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-md rounded-full hover:bg-white shadow-lg transition-all hover:scale-110 active:scale-95"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isLiked
                  ? 'fill-rose-brand-600 text-rose-brand-600'
                  : 'text-ink-600'
              }`}
            />
          </button>

          {/* Bottom overlay actions */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
            <span className="text-white text-xs font-medium px-2.5 py-1 rounded-full bg-plum-900/50 backdrop-blur-sm">
              {style.duration}
            </span>

            <button
              onClick={() => setShowAITryOn(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white text-plum-700 rounded-full hover:bg-plum-50 shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 text-xs font-semibold"
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Try On</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-ink-900 group-hover:text-plum-700 transition-colors text-base leading-snug truncate">
                {style.name}
              </h3>
              <p className="text-xs text-ink-500 mt-0.5 truncate">
                {style.category}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xl font-display font-bold text-plum-700">
                £{style.price}
              </p>
            </div>
          </div>

          {/* Rating + reviews */}
          <div className="flex items-center gap-3 text-xs text-ink-500 mb-4">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-rose-brand-500 text-rose-brand-500" />
              <span className="font-medium text-ink-700">{style.rating}</span>
            </span>
            <span className="w-px h-3.5 bg-cream-300" />
            <span>{style.reviews} reviews</span>
            <span className="w-px h-3.5 bg-cream-300" />
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {style.duration}
            </span>
          </div>

          <button
            onClick={() => setShowBooking(true)}
            className="w-full py-3 bg-plum-700 text-white font-semibold rounded-2xl transition-all hover:bg-plum-800 hover:shadow-lg hover:shadow-plum-700/25 hover:-translate-y-px active:translate-y-0 flex items-center justify-center gap-2 text-sm"
          >
            <Calendar className="w-4 h-4" />
            Book Now
          </button>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
        style={style}
      />

      {/* AI Try-On Modal */}
      {showAITryOn && (
        <div
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 bg-plum-900/60 backdrop-blur-md overflow-y-auto animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAITryOn(false);
          }}
        >
          <div className="w-full max-w-5xl my-4 sm:my-8 animate-slideUp">
            <AITryOn
              selectedStyle={style}
              onClose={() => setShowAITryOn(false)}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(24px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}