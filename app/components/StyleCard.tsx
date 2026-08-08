'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, Clock, Star, Sparkles, Calendar, Brain } from 'lucide-react';
import BookingModal from './BookingModal';
import AITryOn from './AITryOn';
import { Style } from '../types';

interface StyleCardProps {
  style: Style;
}

export default function StyleCard({ style }: StyleCardProps) {
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [showBooking, setShowBooking] = useState<boolean>(false);
  const [showAITryOn, setShowAITryOn] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  const getLengthColor = (length: string): string => {
    const colors: Record<string, string> = {
      'Short': 'bg-blue-100 text-blue-700',
      'Medium': 'bg-emerald-100 text-emerald-700',
      'Long': 'bg-purple-100 text-purple-700',
      'Extra Long': 'bg-rose-100 text-rose-700',
    };
    return colors[length] || 'bg-gray-100 text-gray-700';
  };

  return (
    <>
      <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
        {/* Image - Increased height */}
        <div className="relative h-72 sm:h-80 md:h-96 bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden">
          {!imageError ? (
            <Image
              src={style.image}
              alt={style.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={style.id <= 4}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-light text-gray-400 bg-gradient-to-br from-amber-100 to-amber-200">
              No Image
            </div>
          )}
          
          {/* Badges - Made larger */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${getLengthColor(style.length)}`}>
              {style.length}
            </span>
            {style.isNew && (
              <span className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg">
                NEW
              </span>
            )}
          </div>

          {style.isTrending && (
            <div className="absolute top-3 right-3 px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3 h-3 animate-pulse" />
              TRENDING
            </div>
          )}

          {/* Like Button - Made larger */}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="absolute bottom-16 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-lg transition-all hover:scale-110"
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`} />
          </button>

          {/* AI Try-On Button */}
          <button
            onClick={() => setShowAITryOn(true)}
            className="absolute bottom-4 right-4 p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full hover:shadow-lg transition-all hover:scale-110 shadow-lg flex items-center gap-2 text-white"
          >
            <Brain className="w-5 h-5" />
            <span className="text-xs font-medium hidden sm:inline">AI Try-On</span>
          </button>
        </div>

        {/* Content - Adjusted padding */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors text-base">
                {style.name}
              </h3>
              <p className="text-sm text-gray-500">{style.category}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-amber-600">£{style.price}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {style.duration}
            </span>
            <span className="w-px h-4 bg-gray-200" />
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {style.rating}
            </span>
            <span className="w-px h-4 bg-gray-200" />
            <span>({style.reviews})</span>
          </div>

          <button
            onClick={() => setShowBooking(true)}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-slideUp">
            <AITryOn 
              selectedStyle={style} 
              onClose={() => setShowAITryOn(false)} 
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}