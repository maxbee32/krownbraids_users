// app/wishlist/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Trash2,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Calendar,
  ImageOff,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  WishlistItem,
  getWishlist,
  removeFromWishlist,
  clearWishlist,
  subscribeWishlist,
} from '../../lib/wishlist';

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(getWishlist());

    const unsub = subscribeWishlist(() => setItems(getWishlist()));
    return unsub;
  }, []);

  const handleRemove = (item: WishlistItem) => {
    removeFromWishlist(item.id);
    toast.success('Removed from wishlist');
  };

  const handleClear = () => {
    if (!confirm('Clear your entire wishlist?')) return;
    clearWishlist();
    toast.success('Wishlist cleared');
  };

  const handleBook = (item: WishlistItem) => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('authToken')
        : null;

    if (!token) {
      const bookHref = `/book?salonId=${item.salonId}&serviceId=${item.id}`;
      router.push(
        `/login?redirect=${encodeURIComponent(bookHref)}&reason=book`
      );
      return;
    }

    router.push(`/book?salonId=${item.salonId}&serviceId=${item.id}`);
  };

  // Prevent hydration mismatch — only render list after mount
  if (!mounted) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-espresso-50 py-12 px-4">
          <div className="container-custom text-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-espresso-200 border-t-primary-500 mx-auto" />
            <p className="text-espresso-500 mt-4 text-sm">Loading wishlist…</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="relative min-h-screen bg-espresso-50 py-12 px-4 overflow-hidden">
        {/* Subtle gold glow in the background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] opacity-[0.15]">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-400 via-espresso-400 to-transparent blur-3xl" />
          </div>
        </div>

        <div className="relative container-custom max-w-6xl">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <Link
                href="/salons"
                className="inline-flex items-center gap-1.5 text-sm text-espresso-500 hover:text-espresso-950 font-medium transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue browsing
              </Link>
              <p className="text-xs font-semibold tracking-[0.15em] text-primary-600 uppercase mb-2">
                Saved styles
              </p>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-espresso-950">
                Your wishlist
              </h1>
              <p className="text-espresso-500 mt-2">
                {items.length === 0
                  ? 'Tap the heart on any style to save it here.'
                  : `${items.length} ${
                      items.length === 1 ? 'item' : 'items'
                    } saved`}
              </p>
            </div>

            {items.length > 0 && (
              <button
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-espresso-600 border border-espresso-200 bg-white rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors self-start sm:self-auto"
              >
                <Trash2 className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>

          {/* Empty state */}
          {items.length === 0 ? (
            <div className="bg-white rounded-3xl border border-espresso-100 p-12 sm:p-16 text-center shadow-[0_20px_60px_-15px_rgba(42,34,31,0.1)]">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-espresso-50 border border-espresso-100 flex items-center justify-center">
                <Heart className="w-9 h-9 text-espresso-300" />
              </div>
              <h2 className="text-2xl font-display font-bold text-espresso-950">
                No saved styles yet
              </h2>
              <p className="text-espresso-500 mt-3 text-sm max-w-sm mx-auto leading-relaxed">
                When you find a look you love, tap the heart on any service or
                style and it&apos;ll appear here.
              </p>
              <Link
                href="/salons"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-espresso-950 text-white font-semibold text-sm rounded-xl hover:bg-primary-500 hover:text-espresso-950 transition-all shadow-lg shadow-espresso-950/10"
              >
                <Sparkles className="w-4 h-4" />
                Discover salons
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <WishlistCard
                  key={`${item.type}-${item.id}`}
                  item={item}
                  onRemove={() => handleRemove(item)}
                  onBook={() => handleBook(item)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Individual card                                                    */
/* ------------------------------------------------------------------ */

function WishlistCard({
  item,
  onRemove,
  onBook,
}: {
  item: WishlistItem;
  onRemove: () => void;
  onBook: () => void;
}) {
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(item.image) && !imageError;

  // Format saved date as friendly relative text
  const savedAgo = (() => {
    const diffMs = Date.now() - item.addedAt;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(item.addedAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  })();

  return (
    <div className="group bg-white rounded-2xl border border-espresso-100 overflow-hidden hover:border-primary-300 hover:shadow-[0_20px_40px_-20px_rgba(42,34,31,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-espresso-50 overflow-hidden">
        {showImage ? (
          <Image
            src={item.image!}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-espresso-300 gap-2">
            <ImageOff className="w-8 h-8" />
            <span className="text-[10px] font-medium uppercase tracking-wider">No Image</span>
          </div>
        )}

        {/* Remove button */}
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove from wishlist"
          className="absolute top-3 right-3 p-2 rounded-full bg-white/95 backdrop-blur-md shadow-md hover:bg-red-50 hover:scale-110 active:scale-95 transition-all z-10"
        >
          <X className="w-4 h-4 text-red-600" />
        </button>

        {/* Type badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-espresso-950/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
          {item.type === 'service' ? 'Service' : 'Style'}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-espresso-950 text-lg truncate">
              {item.name}
            </h3>
            {item.category && (
              <p className="text-[11px] font-semibold text-primary-600 uppercase tracking-wider mt-1">
                {item.category}
              </p>
            )}
          </div>
          {item.price !== undefined && (
            <p className="text-lg font-display font-bold text-espresso-950 flex-shrink-0">
              £{item.price}
            </p>
          )}
        </div>

        {item.salonName && (
          <p className="text-sm text-espresso-500 mb-3">
            at{' '}
            <span className="font-semibold text-espresso-900">
              {item.salonName}
            </span>
          </p>
        )}

        <p className="text-[11px] text-espresso-400 mb-4 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          Saved {savedAgo}
        </p>

        {/* Action row — bottom aligned */}
        <div className="mt-auto pt-4 border-t border-espresso-100 flex items-center justify-between gap-3">
          {item.type === 'service' && item.salonId ? (
            <button
              onClick={onBook}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-espresso-950 text-white text-sm font-semibold rounded-xl hover:bg-primary-500 hover:text-espresso-950 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Book now
            </button>
          ) : (
            <Link
              href="/salons"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-espresso-950 text-white text-sm font-semibold rounded-xl hover:bg-primary-500 hover:text-espresso-950 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Find a salon
            </Link>
          )}

          <button
            onClick={onRemove}
            className="p-2.5 rounded-xl text-espresso-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Remove from wishlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}