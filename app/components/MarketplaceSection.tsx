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
    toast.success(`✅ Added ${item.name} to cart!`);
  };

  const handleViewAll = () => {
    setShowAll(!showAll);
    if (!showAll) {
      toast.success('Showing all marketplace items');
    }
  };

  // Show only first 4 items if not showing all
  const displayedItems = showAll ? marketplaceItems : marketplaceItems.slice(0, 4);

  return (
    <section className="py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <ShoppingBag className="w-4 h-4" />
            Marketplace
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900">
            Explore Our <span className="text-amber-600">Wig Collections</span>
          </h2>
          <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
            Premium quality wigs and hair accessories curated for every style and occasion
          </p>
        </div>

        {/* Marketplace Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-72 bg-gradient-to-br from-amber-50 to-amber-100/50 overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  {item.isNew && (
                    <span className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg shadow-sm">
                      NEW
                    </span>
                  )}
                  {item.isTrending && (
                    <span className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3 animate-pulse" />
                      TRENDING
                    </span>
                  )}
                </div>

                {/* Like Button */}
                <button
                  onClick={() => toggleLike(item.id)}
                  className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-lg transition-all hover:scale-110"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      likedItems.has(item.id)
                        ? 'fill-rose-500 text-rose-500'
                        : 'text-gray-600'
                    }`}
                  />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors text-sm truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-400">{item.category}</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-lg font-bold text-amber-600">£{item.price}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {item.rating}
                  </span>
                  <span className="w-px h-3 bg-gray-200" />
                  <span>({item.reviews})</span>
                </div>

                <button
                  onClick={() => addToCart(item)}
                  className={`w-full mt-4 py-2.5 text-white font-medium rounded-xl transition-all hover:shadow-lg flex items-center justify-center gap-2 text-sm ${
                    cartItems.has(item.id)
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {cartItems.has(item.id) ? 'In Cart ✓' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        {marketplaceItems.length > 4 && (
          <div className="text-center mt-8">
            <button
              onClick={handleViewAll}
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-amber-500 text-amber-600 font-semibold rounded-full hover:bg-amber-500 hover:text-white transition-all hover:shadow-lg"
            >
              {showAll ? 'Show Less' : 'View All Marketplace Items'}
              <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
            </button>
          </div>
        )}

        {/* Show count */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Showing {displayedItems.length} of {marketplaceItems.length} items
            {cartItems.size > 0 && ` • ${cartItems.size} item${cartItems.size > 1 ? 's' : ''} in cart`}
          </p>
        </div>
      </div>
    </section>
  );
}