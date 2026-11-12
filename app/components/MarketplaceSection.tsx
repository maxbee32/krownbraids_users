// app/components/MarketplaceSection.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Star,
  Sparkles,
  ShoppingBag,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  category: string;     // will be empty string if backend doesn't send one
  price: number;
  description: string;
  image: string;
  rating: number | null;
  reviews: number | null;
  isNew: boolean;
  isTrending: boolean;
}

// Universal image URL cleaner
const proxyImageUrl = (url: string | null | undefined): string => {
  if (!url) return '/assets/img/placeholder.jpg';
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  if (url.startsWith('/api/uploads/')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const prefixed = url.match(
    /(?:products|suppliers)\/([^/]+)\/([^/]+\.(?:jpe?g|png|webp|gif|avif|svg))$/i
  );
  if (prefixed) {
    const [, supplierId, filename] = prefixed;
    return `/api/uploads/${supplierId}/${filename}`;
  }

  const bare = url.match(/^\/([^/]+)\/([^/]+\.(?:jpe?g|png|webp|gif|avif|svg))$/i);
  if (bare) {
    const [, supplierId, filename] = bare;
    return `/api/uploads/${supplierId}/${filename}`;
  }

  return '/assets/img/placeholder.jpg';
};

function extractItems(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.products)) return payload.products;
  return [];
}

function toNumberOrNull(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const n = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(n) ? n : null;
}

function normalizeProduct(raw: any): Product {
  return {
    id: String(raw.id ?? raw.productId ?? Math.random()),
    name: raw.name ?? raw.title ?? 'Untitled',
    // ✅ No hardcoded "Wigs" fallback — only what the backend sends
    category: (raw.category ?? raw.categoryName ?? '').toString().trim(),
    price: Number(raw.price ?? raw.unitPrice ?? 0),
    description: raw.description ?? raw.shortDescription ?? '',
    image: proxyImageUrl(raw.imageUrl ?? raw.image),
    rating: toNumberOrNull(raw.rating ?? raw.averageRating ?? raw.avgRating),
    reviews: toNumberOrNull(
      raw.reviewCount ?? raw.reviews ?? raw.totalReviews
    ),
    isNew: Boolean(raw.isNew ?? raw.newArrival ?? false),
    isTrending: Boolean(raw.isTrending ?? raw.featured ?? false),
  };
}

export default function MarketplaceSection() {
  const router = useRouter();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/marketplace/products?size=4', {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Failed to load');

        const payload = await res.json();
        const rawItems = extractItems(payload);

        setItems(rawItems.slice(0, 4).map(normalizeProduct));
      } catch (err) {
        console.error('Failed to load items:', err);
        toast.error('Could not load marketplace items.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleLike = (id: string) => {
    const next = new Set(likedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLikedItems(next);
  };

  const goToMarketplace = () => {
    router.push('/marketplace');
  };

  return (
    <section className="py-20 bg-white border-t border-espresso-100">
      <div className="container-custom">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-xs font-semibold text-primary-700 tracking-wider uppercase mb-4">
            <ShoppingBag className="w-3.5 h-3.5" />
            Marketplace
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-espresso-950 leading-tight">
            Wig collections and hair accessories
          </h2>

          <p className="text-espresso-500 mt-4 max-w-lg leading-relaxed text-base">
            Curated for every style and occasion. Shop trusted brands, trade
            prices, straight from your dashboard.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-espresso-100/50 animate-pulse aspect-[3/4]"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-espresso-50 rounded-2xl border border-espresso-100">
            <p className="text-espresso-500">No products available right now.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-white rounded-2xl border border-espresso-100 overflow-hidden hover:border-primary-300 hover:shadow-[0_20px_40px_-20px_rgba(42,34,31,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-64 bg-espresso-50 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      unoptimized
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {item.isNew && (
                        <span className="px-2.5 py-1 bg-espresso-950 text-white text-[10px] font-bold rounded-full tracking-wider uppercase shadow-sm">
                          New
                        </span>
                      )}
                      {item.isTrending && (
                        <span className="px-2.5 py-1 bg-white text-primary-700 text-[10px] font-bold rounded-full tracking-wider uppercase flex items-center gap-1 border border-primary-200 shadow-sm">
                          <Sparkles className="w-2.5 h-2.5" />
                          Trending
                        </span>
                      )}
                    </div>

                    {/* Wishlist heart */}
                    <button
                      onClick={() => toggleLike(item.id)}
                      aria-label={
                        likedItems.has(item.id)
                          ? 'Remove from wishlist'
                          : 'Add to wishlist'
                      }
                      className="absolute bottom-3 right-3 p-2 bg-white/95 backdrop-blur-sm rounded-full hover:bg-white shadow-md transition-all hover:scale-110"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          likedItems.has(item.id)
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
                        <h3 className="font-semibold text-espresso-950 text-sm truncate group-hover:text-primary-600 transition-colors">
                          {item.name}
                        </h3>
                        {/* ✅ Only render the category if it exists */}
                        {item.category && (
                          <p className="text-[11px] font-semibold text-primary-600 uppercase tracking-wider mt-1 truncate">
                            {item.category}
                          </p>
                        )}
                      </div>
                      <p className="text-lg font-display font-bold text-espresso-950 flex-shrink-0">
                        £{item.price.toFixed(2)}
                      </p>
                    </div>

                    <p className="text-sm text-espresso-600 mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Rating — only if data exists */}
                    {(item.rating !== null || item.reviews !== null) && (
                      <div className="flex items-center gap-2 text-xs text-espresso-500 mt-3">
                        {item.rating !== null && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-primary-500 text-primary-500" />
                            <span className="font-semibold text-espresso-950">
                              {item.rating.toFixed(1)}
                            </span>
                          </span>
                        )}
                        {item.rating !== null && item.reviews !== null && (
                          <span className="w-px h-3 bg-espresso-200" />
                        )}
                        {item.reviews !== null && (
                          <span>
                            {item.reviews}{' '}
                            {item.reviews === 1 ? 'review' : 'reviews'}
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      onClick={goToMarketplace}
                      className="w-full mt-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 bg-espresso-950 hover:bg-primary-500 hover:text-espresso-950 mt-auto"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      View in Marketplace
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* View all */}
            <div className="text-center mt-12">
              <button
                onClick={goToMarketplace}
                className="inline-flex items-center gap-2 px-7 py-3 bg-white border border-espresso-200 text-espresso-950 text-sm font-bold rounded-full hover:bg-espresso-50 hover:border-primary-300 transition-all shadow-sm"
              >
                View all items
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}