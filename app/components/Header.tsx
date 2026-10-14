'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, User, Calendar, Heart, LogOut, LogIn } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const check = () => setIsAuthed(!!localStorage.getItem('authToken'));
    check();
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
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
    setIsAuthed(false);
    setIsMenuOpen(false);
    router.push('/');
  };

  const closeMenu = () => setIsMenuOpen(false);

  const onLoginPage = pathname === '/login';
  const onRegisterPage = pathname === '/register';

  return (
    <header
      className={`sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-stone-200 transition-all duration-300 ${
        scrolled ? 'shadow-[0_1px_3px_rgba(28,25,23,0.04)]' : ''
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
            {/* Nav links */}
            <Link
              href="/salons"
              className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-ink-900 transition-colors"
            >
              Browse
            </Link>

            <div className="w-px h-5 bg-stone-200 mx-2" />

            {/* Icon buttons */}
            <button
              className="relative p-2.5 rounded-full hover:bg-stone-100 transition-colors text-stone-600 hover:text-ink-900"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-ink-900 text-white text-[10px] rounded-full flex items-center justify-center font-bold ring-2 ring-white">
                3
              </span>
            </button>

            <button
              className="p-2.5 rounded-full hover:bg-stone-100 transition-colors text-stone-600 hover:text-ink-900"
              aria-label="Bookings"
            >
              <Calendar className="w-5 h-5" />
            </button>

            <div className="w-px h-5 bg-stone-200 mx-2" />

            {isAuthed ? (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-ink-900 rounded-full flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Sign out</span>
              </button>
            ) : (
              <>
                {!onLoginPage && (
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-ink-900 rounded-full flex items-center gap-2 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden lg:inline">Sign In</span>
                  </Link>
                )}
                {!onRegisterPage && (
                  <Link
                    href="/register"
                    className="ml-1 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-full bg-ink-900 hover:bg-ink-800 hover:-translate-y-px active:translate-y-0 transition-all shadow-sm"
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
            className="md:hidden p-2.5 rounded-xl hover:bg-stone-100 transition-colors text-ink-900"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200 space-y-3">
            {/* Nav link */}
            <Link
              href="/salons"
              onClick={closeMenu}
              className="block px-4 py-2.5 text-sm font-medium text-ink-900 hover:bg-stone-100 rounded-xl transition-colors"
            >
              Browse salons
            </Link>

            {isAuthed ? (
              <button
                onClick={handleSignOut}
                className="w-full py-2.5 text-center text-sm font-medium text-stone-700 rounded-full border border-stone-200 hover:bg-stone-100 flex items-center justify-center gap-2 transition-colors"
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
                    className="w-full py-2.5 rounded-full bg-ink-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-ink-800 transition-all"
                  >
                    <User className="w-4 h-4" />
                    Create account
                  </Link>
                )}
                {!onLoginPage && (
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="w-full py-2.5 text-center text-sm font-medium text-stone-700 hover:text-ink-900 rounded-full border border-stone-200 hover:bg-stone-100 flex items-center justify-center gap-2 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                )}
              </>
            )}

            <div className="flex items-center justify-around pt-3 border-t border-stone-200">
              <button className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-ink-900 transition-colors">
                <Heart className="w-5 h-5" />
                <span>Wishlist</span>
              </button>
              <button className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-ink-900 transition-colors">
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