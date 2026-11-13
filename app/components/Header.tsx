'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  X,
  User,
  Calendar,
  Heart,
  LogOut,
  LogIn,
  Package,
  Search,
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { getWishlistCount, subscribeWishlist } from '../../lib/wishlist';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAuth = () => setIsAuthed(!!localStorage.getItem('authToken'));
    const checkWish = () => setWishlistCount(getWishlistCount());

    checkAuth();
    checkWish();

    window.addEventListener('storage', checkAuth);
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

  useEffect(() => {
    if (isMenuOpen) {
      setScrolled(false);
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');

    window.dispatchEvent(new Event('storage'));
    setIsAuthed(false);
    setIsMenuOpen(false);

    const rawCurrent =
      pathname + (typeof window !== 'undefined' ? window.location.search : '');
    const safeRedirect =
      rawCurrent.startsWith('/login') || rawCurrent.startsWith('/register')
        ? '/'
        : rawCurrent;

    router.push(
      `/login?redirect=${encodeURIComponent(safeRedirect)}&reason=account`
    );
  };

  const closeMenu = () => setIsMenuOpen(false);

  const onLoginPage = pathname?.startsWith('/login') ?? false;
  const onRegisterPage = pathname?.startsWith('/register') ?? false;

  const showSignInButton = mounted && !isAuthed && !onLoginPage;
  const showRegisterButton = mounted && !isAuthed && !onRegisterPage;

  const isActive = (href: string) =>
    !!pathname && (pathname === href || pathname.startsWith(href + '/'));

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-espresso-900/95 backdrop-blur-xl border-espresso-700 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)]'
          : 'bg-espresso-900 border-espresso-800'
      }`}
    >
      {/* Gold hairline */}
      <div
        aria-hidden="true"
        className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary-500/70 to-transparent"
      />

      <div className="container-custom">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-[72px] sm:h-20 overflow-hidden">
          {/* Logo wrapper — min-w-0 lets it shrink if needed */}
          <div className="flex items-center min-w-0 [&>a]:flex [&>a]:items-center [&>a]:gap-2">
            <Logo onClick={closeMenu} size={scrolled ? 'sm' : 'md'} />
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-end min-w-0">
            <NavLink href="/salons" active={isActive('/salons')}>
              Browse
            </NavLink>
            <NavLink href="/marketplace" active={isActive('/marketplace')}>
              Shop
            </NavLink>

            <div className="w-px h-5 bg-espresso-700 mx-3" aria-hidden="true" />

            <IconLink href="/salons" label="Search">
              <Search className="w-[18px] h-[18px]" />
            </IconLink>

            <IconLink
              href="/wishlist"
              label={`Wishlist (${wishlistCount} items)`}
              badge={wishlistCount}
            >
              <Heart className="w-[18px] h-[18px]" />
            </IconLink>

            {isAuthed && (
              <IconLink href="/bookings" label="My bookings">
                <Calendar className="w-[18px] h-[18px]" />
              </IconLink>
            )}

            {isAuthed && (
              <IconLink href="/orders" label="My orders">
                <Package className="w-[18px] h-[18px]" />
              </IconLink>
            )}

            {isAuthed && (
              <IconLink href="/account" label="Account settings">
                <User className="w-[18px] h-[18px]" />
              </IconLink>
            )}

            <div className="w-px h-5 bg-espresso-700 mx-3" aria-hidden="true" />

            {isAuthed ? (
              <button
                onClick={handleSignOut}
                className="ml-1 inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-espresso-200 hover:text-white rounded-full transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Sign out</span>
              </button>
            ) : (
              <>
                {showSignInButton && (
                  <Link
                    href="/login"
                    className="px-3 py-2 text-[13px] font-medium text-espresso-200 hover:text-white rounded-full transition-colors"
                  >
                    Sign in
                  </Link>
                )}
                {showRegisterButton && (
                  <Link
                    href="/register"
                    className="ml-2 inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-espresso-950 rounded-full bg-primary-500 hover:bg-primary-400 transition-all duration-200 shadow-[0_4px_14px_-4px_rgba(212,145,76,0.4)] hover:shadow-[0_6px_20px_-4px_rgba(212,145,76,0.6)] hover:-translate-y-[1px] whitespace-nowrap"
                  >
                    Get started
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Mobile actions */}
          <div className="flex md:hidden items-center gap-1 xs:gap-2 shrink-0">
            <IconLink href="/salons" label="Search" mobile>
              <Search className="w-5 h-5" />
            </IconLink>

            <IconLink
              href="/wishlist"
              label={`Wishlist (${wishlistCount})`}
              badge={wishlistCount}
              mobile
            >
              <Heart className="w-5 h-5" />
            </IconLink>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-white hover:bg-espresso-800 transition-colors"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-[calc(2px+var(--header-h))] bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
            onClick={closeMenu}
            aria-hidden="true"
          />

          <div
            id="mobile-menu"
            className="md:hidden fixed inset-x-0 top-[calc(2px+var(--header-h))] bottom-0 bg-espresso-900 z-40 overflow-y-auto animate-slide-down border-t border-espresso-700"
          >
            <div className="container-custom py-5 space-y-1">
              <MobileLink href="/salons" onClick={closeMenu} active={isActive('/salons')}>
                Browse salons
              </MobileLink>
              <MobileLink
                href="/marketplace"
                onClick={closeMenu}
                active={isActive('/marketplace')}
              >
                Marketplace
              </MobileLink>
              <MobileLink
                href="/wishlist"
                onClick={closeMenu}
                active={isActive('/wishlist')}
              >
                Wishlist
                {wishlistCount > 0 && (
                  <span className="ml-2 text-xs text-primary-500 font-semibold">
                    ({wishlistCount})
                  </span>
                )}
              </MobileLink>

              {isAuthed && (
                <>
                  <div className="pt-4 pb-2 text-[11px] uppercase tracking-wider text-espresso-400 font-semibold px-4">
                    Account
                  </div>
                  <MobileLink
                    href="/bookings"
                    onClick={closeMenu}
                    active={isActive('/bookings')}
                  >
                    My bookings
                  </MobileLink>
                  <MobileLink
                    href="/orders"
                    onClick={closeMenu}
                    active={isActive('/orders')}
                  >
                    My orders
                  </MobileLink>
                  <MobileLink
                    href="/account"
                    onClick={closeMenu}
                    active={isActive('/account')}
                  >
                    Account settings
                  </MobileLink>
                </>
              )}

              <div className="pt-5 mt-3 border-t border-espresso-700 space-y-2">
                {isAuthed ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full py-3 text-center text-sm font-medium text-espresso-100 rounded-full border border-espresso-700 hover:bg-espresso-800 flex items-center justify-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                ) : (
                  <>
                    {showRegisterButton && (
                      <Link
                        href="/register"
                        onClick={closeMenu}
                        className="w-full py-3 rounded-full bg-primary-500 text-espresso-950 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary-400 transition-colors shadow-[0_4px_14px_-4px_rgba(212,145,76,0.4)]"
                      >
                        Get started
                      </Link>
                    )}
                    {showSignInButton && (
                      <Link
                        href="/login"
                        onClick={closeMenu}
                        className="w-full py-3 text-center text-sm font-medium text-espresso-100 rounded-full border border-espresso-700 hover:bg-espresso-800 flex items-center justify-center gap-2 transition-colors"
                      >
                        <LogIn className="w-4 h-4" />
                        Sign in
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

/* ───── Subcomponents ───── */

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative px-3 py-2 text-[13px] font-medium transition-colors group ${
        active ? 'text-white' : 'text-espresso-200 hover:text-white'
      }`}
    >
      {children}
      <span
        aria-hidden="true"
        className={`absolute bottom-1 left-3 right-3 h-[2px] rounded-full bg-primary-500 origin-left transition-transform duration-300 ${
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}
      />
    </Link>
  );
}

function IconLink({
  href,
  label,
  badge,
  mobile,
  children,
}: {
  href: string;
  label: string;
  badge?: number;
  mobile?: boolean;
  children: React.ReactNode;
}) {
  const iconCls = mobile
    ? 'relative p-2.5 rounded-full text-white/70 hover:text-white hover:bg-espresso-800 transition-colors'
    : 'relative p-2.5 rounded-full text-espresso-200 hover:text-white hover:bg-espresso-800 transition-colors';

  return (
    <Link href={href} className={iconCls} aria-label={label}>
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-primary-500 text-espresso-950 text-[10px] rounded-full flex items-center justify-center font-bold ring-2 ring-espresso-900">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

function MobileLink({
  href,
  onClick,
  active,
  children,
}: {
  href: string;
  onClick: () => void;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${
        active
          ? 'bg-espresso-800 text-white'
          : 'text-espresso-100 hover:bg-espresso-800/60'
      }`}
    >
      <span>{children}</span>
    </Link>
  );
}