'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, Star, Sparkles, ShoppingBag, ChevronRight } from 'lucide-react';
import { marketplaceItems } from '../../lib/data';
import toast from 'react-hot-toast';

export default function MarketplaceSection() {
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [cartItems, setCartItems] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState<boolean>(false);

  const toggleLike = (id: string) => {
    const newLiked = new Set(likedItems);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedItems(newLiked);
  };

  const addToCart = (item: any) => {
    const newCart = new Set(cartItems);
    if (newCart.has(item.id)) {
      toast.error(`${item.name} is already in your cart`);
      return;
    }
    newCart.add(item.id);
    setCartItems(newCart);
    toast.success(`Added ${item.name} to cart`);
  };

  const handleViewAll = () => {
    setShowAll(!showAll);
  };

  const displayedItems = showAll
    ? marketplaceItems
    : marketplaceItems.slice(0, 4);

  return (
    <section className="py-16 bg-stone-50 border-t border-stone-200">
      <div className="container-custom">
        {/* Header */}
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-xs font-medium text-stone-600 tracking-wide uppercase mb-4">
            <ShoppingBag className="w-3.5 h-3.5" />
            Marketplace
          </div>

          <h2 className="text-3xl sm:text-4xl font-display font-bold text-ink-900">
            Wig collections and hair accessories
          </h2>

          <p className="text-stone-600 mt-3 max-w-lg leading-relaxed">
            Curated for every style and occasion. Shop trusted brands, trade
            prices, straight from your dashboard.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayedItems.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-stone-300 hover:shadow-[0_20px_40px_-20px_rgba(28,25,23,0.15)] transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-64 bg-stone-100 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {item.isNew && (
                    <span className="px-2.5 py-1 bg-ink-900 text-white text-[10px] font-bold rounded-full tracking-wide uppercase">
                      New
                    </span>
                  )}
                  {item.isTrending && (
                    <span className="px-2.5 py-1 bg-white text-ink-900 text-[10px] font-bold rounded-full tracking-wide uppercase flex items-center gap-1 border border-stone-200">
                      <Sparkles className="w-2.5 h-2.5" />
                      Trending
                    </span>
                  )}
                </div>

                {/* Like button */}
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
                        ? 'fill-rose-500 text-rose-500'
                        : 'text-stone-600'
                    }`}
                  />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ink-900 text-sm truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {item.category}
                    </p>
                  </div>
                  <p className="text-base font-display font-bold text-ink-900 flex-shrink-0">
                    £{item.price}
                  </p>
                </div>

                <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-stone-500 mt-3">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span className="font-medium text-ink-900">
                      {item.rating}
                    </span>
                  </span>
                  <span className="w-px h-3 bg-stone-200" />
                  <span>{item.reviews} reviews</span>
                </div>

                <button
                  onClick={() => addToCart(item)}
                  className={`w-full mt-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    cartItems.has(item.id)
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-ink-900 hover:bg-ink-800'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {cartItems.has(item.id) ? 'In cart' : 'Add to cart'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View all button */}
        {marketplaceItems.length > 4 && (
          <div className="text-center mt-10">
            <button
              onClick={handleViewAll}
              className="inline-flex items-center gap-2 px-6 py-3 border border-stone-300 text-ink-800 text-sm font-semibold rounded-full hover:bg-stone-100 hover:border-stone-400 transition-all"
            >
              {showAll ? 'Show less' : 'View all items'}
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-300 ${
                  showAll ? 'rotate-90' : ''
                }`}
              />
            </button>
          </div>
        )}

        {/* Count line */}
        <div className="text-center mt-4">
          <p className="text-xs text-stone-500">
            Showing {displayedItems.length} of {marketplaceItems.length} items
            {cartItems.size > 0 &&
              ` · ${cartItems.size} item${cartItems.size > 1 ? 's' : ''} in cart`}
          </p>
        </div>
      </div>
    </section>
  );
}