'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, User, Calendar, Heart, LogOut, LogIn } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { getWishlistCount, subscribeWishlist } from '../../lib/wishlist';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const checkAuth = () => setIsAuthed(!!localStorage.getItem('authToken'));
    const checkWish = () => setWishlistCount(getWishlistCount());

    checkAuth();
    checkWish();

    window.addEventListener('storage', checkAuth);

    // Subscribe to wishlist changes (same-tab + cross-tab)
    const unsubscribeWish = subscribeWishlist(checkWish);

    return () => {
      window.removeEventListener('storage', checkAuth);
      unsubscribeWish();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');

    // Notify other tabs + our own auth listener (browsers don't fire
    // `storage` on the tab that made the change).
    window.dispatchEvent(new Event('storage'));

    setIsAuthed(false);
    setIsMenuOpen(false);

    // Send to login with a return path + context banner, so the user
    // can sign back in immediately if they clicked by mistake.
    const current =
      pathname + (typeof window !== 'undefined' ? window.location.search : '');
    router.push(
      `/login?redirect=${encodeURIComponent(current)}&reason=account`
    );
  };

  const closeMenu = () => setIsMenuOpen(false);

  const onLoginPage = pathname === '/login';
  const onRegisterPage = pathname === '/register';

  return (
    <header
      className={`sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-cream-200 transition-all duration-300 ${
        scrolled ? 'shadow-[0_1px_3px_rgba(122,38,65,0.05)]' : ''
      }`}
    >
      <div className="container-custom">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'
          }`}
        >
          <Logo onClick={closeMenu} />

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/salons"
              className="px-3 py-2 text-sm font-medium text-ink-600 hover:text-plum-700 transition-colors"
            >
              Browse
            </Link>

            <div className="w-px h-5 bg-cream-200 mx-2" />

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2.5 rounded-full hover:bg-plum-50 transition-colors text-ink-600 hover:text-plum-700"
              aria-label={`Wishlist (${wishlistCount} items)`}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-rose-brand-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold ring-2 ring-white">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>

            <button
              className="p-2.5 rounded-full hover:bg-plum-50 transition-colors text-ink-600 hover:text-plum-700"
              aria-label="Bookings"
            >
              <Calendar className="w-5 h-5" />
            </button>

            <div className="w-px h-5 bg-cream-200 mx-2" />

            {isAuthed ? (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-ink-600 hover:text-plum-700 rounded-full flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Sign out</span>
              </button>
            ) : (
              <>
                {!onLoginPage && (
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-ink-600 hover:text-plum-700 rounded-full flex items-center gap-2 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden lg:inline">Sign In</span>
                  </Link>
                )}
                {!onRegisterPage && (
                  <Link
                    href="/register"
                    className="ml-1 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-full bg-plum-700 hover:bg-plum-800 hover:-translate-y-px active:translate-y-0 transition-all shadow-sm"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">Register</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 rounded-xl hover:bg-plum-50 transition-colors text-ink-900"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-cream-200 space-y-3">
            <Link
              href="/salons"
              onClick={closeMenu}
              className="block px-4 py-2.5 text-sm font-medium text-ink-900 hover:bg-plum-50 rounded-xl transition-colors"
            >
              Browse salons
            </Link>

            {isAuthed ? (
              <button
                onClick={handleSignOut}
                className="w-full py-2.5 text-center text-sm font-medium text-ink-700 rounded-full border border-cream-200 hover:bg-plum-50 flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            ) : (
              <>
                {!onRegisterPage && (
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="w-full py-2.5 rounded-full bg-plum-700 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-plum-800 transition-all"
                  >
                    <User className="w-4 h-4" />
                    Create account
                  </Link>
                )}
                {!onLoginPage && (
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="w-full py-2.5 text-center text-sm font-medium text-ink-700 hover:text-plum-700 rounded-full border border-cream-200 hover:bg-plum-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                )}
              </>
            )}

            <div className="flex items-center justify-around pt-3 border-t border-cream-200">
              <Link
                href="/wishlist"
                onClick={closeMenu}
                className="flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-plum-700 transition-colors"
              >
                <Heart className="w-5 h-5" />
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="min-w-4 h-4 px-1 bg-rose-brand-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>
              <button className="flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-plum-700 transition-colors">
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