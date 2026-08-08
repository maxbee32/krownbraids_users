'use client';

import { useState } from 'react';
import { Crown, Menu, X, User, Calendar, Heart } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            
            <div>
              <h1 className="text-lg sm:text-2xl font-display font-bold tracking-tight whitespace-nowrap">
                <span className="text-gray-900">KROWN</span>
                <span className="text-amber-600"> BRAIDS</span>
              </h1>
              <p className="text-[8px] sm:text-[10px] text-gray-400 tracking-[0.2em] font-light uppercase">
                wear your crown
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
              <Heart className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                3
              </span>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
              <Calendar className="w-5 h-5 text-gray-600" />
            </button>
            <button className="btn-primary text-sm px-4 py-2 rounded-full flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden lg:inline">Sign In</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
            <button className="w-full btn-primary rounded-full text-center flex items-center justify-center gap-2">
              <User className="w-4 h-4" />
              Sign In
            </button>
            <div className="flex items-center justify-around pt-2">
              <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-amber-600 transition-colors">
                <Heart className="w-5 h-5" />
                <span>Wishlist</span>
              </button>
              <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-amber-600 transition-colors">
                <Calendar className="w-5 h-5" />
                <span>Bookings</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}