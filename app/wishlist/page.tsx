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
        <main className="min-h-screen bg-cream-50 py-12 px-4">
          <div className="container-custom text-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-plum-200 border-t-plum-700 mx-auto" />
            <p className="text-ink-500 mt-4 text-sm">Loading wishlist…</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="relative min-h-screen bg-cream-50 py-10 px-4 overflow-hidden">
        {/* Soft rose bloom in the background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] opacity-[0.22]">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-brand-200 via-plum-100 to-transparent blur-3xl" />
          </div>
          <div
            className="absolute inset-0 opacity-[0.25] mix-blend-soft-light"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, #7a2641 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="relative container-custom max-w-6xl">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <Link
                href="/salons"
                className="inline-flex items-center gap-1.5 text-sm text-plum-700 hover:text-plum-800 font-medium transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue browsing
              </Link>
              <p className="text-xs font-semibold tracking-[0.15em] text-rose-brand-600 uppercase mb-2">
                Saved styles
              </p>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink-900">
                Your wishlist
              </h1>
              <p className="text-ink-500 mt-2">
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
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-ink-600 border border-cream-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors self-start sm:self-auto"
              >
                <Trash2 className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>

          {/* Empty state */}
          {items.length === 0 ? (
            <div className="bg-white rounded-3xl border border-cream-200 p-12 sm:p-16 text-center shadow-[0_12px_40px_-20px_rgba(122,38,65,0.12)]">
              <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-plum-50 border border-plum-100 flex items-center justify-center">
                <Heart className="w-9 h-9 text-plum-400" />
              </div>
              <h2 className="text-xl font-display font-semibold text-ink-900">
                No saved styles yet
              </h2>
              <p className="text-ink-500 mt-2 text-sm max-w-sm mx-auto leading-relaxed">
                When you find a look you love, tap the heart on any service or
                style and it&apos;ll appear here.
              </p>
              <Link
                href="/salons"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-plum-700 text-white font-medium text-sm rounded-xl hover:bg-plum-800 hover:shadow-lg hover:shadow-plum-700/25 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Discover salons
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
    <div className="group bg-white rounded-2xl border border-cream-200 overflow-hidden hover:border-plum-200 hover:shadow-[0_20px_40px_-20px_rgba(122,38,65,0.22)] transition-all duration-300 flex flex-col">
      {/* Image */}
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
            src={item.image!}
            alt={item.name}
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

        {/* Remove button — replaces heart */}
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove from wishlist"
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-red-50 hover:scale-110 active:scale-95 transition-all"
        >
          <X className="w-4 h-4 text-red-600" />
        </button>

        {/* Type badge — distinguishes style from service */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-plum-900/60 backdrop-blur-sm text-white text-xs font-medium">
          {item.type === 'service' ? 'Service' : 'Style'}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-ink-900 text-base truncate">
              {item.name}
            </h3>
            {item.category && (
              <p className="text-xs text-ink-500 mt-0.5">{item.category}</p>
            )}
          </div>
          {item.price !== undefined && (
            <p className="text-lg font-display font-bold text-plum-700 flex-shrink-0">
              £{item.price}
            </p>
          )}
        </div>

        {item.salonName && (
          <p className="text-xs text-ink-500 mb-3">
            at{' '}
            <span className="font-medium text-ink-700">
              {item.salonName}
            </span>
          </p>
        )}

        <p className="text-[11px] text-ink-400 mb-3 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Saved {savedAgo}
        </p>

        {/* Action row — bottom aligned */}
        <div className="mt-auto pt-4 border-t border-cream-200 flex items-center justify-between gap-3">
          {item.type === 'service' && item.salonId ? (
            <button
              onClick={onBook}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-plum-700 text-white text-sm font-semibold rounded-xl hover:bg-plum-800 hover:-translate-y-px active:translate-y-0 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Book
            </button>
          ) : (
            <Link
              href="/salons"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-plum-700 text-white text-sm font-semibold rounded-xl hover:bg-plum-800 hover:-translate-y-px active:translate-y-0 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Find salon
            </Link>
          )}

          <button
            onClick={onRemove}
            className="p-2 rounded-full text-ink-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Remove from wishlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}