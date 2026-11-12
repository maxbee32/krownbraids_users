// app/components/Footer.tsx
import Link from 'next/link';
import { Logo } from '../components/ui/Logo';

interface FooterLink {
  label: string;
  href: string;
}

export default function Footer() {
  const year: number = new Date().getFullYear();

  const discoverLinks: FooterLink[] = [
    { label: 'Browse salons', href: '/salons' },
    { label: 'Shop marketplace', href: '/marketplace' },
    { label: 'About us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const myAccountLinks: FooterLink[] = [
    { label: 'My bookings', href: '/bookings' },
    { label: 'My orders', href: '/orders' },
    { label: 'Account settings', href: '/account' },
    { label: 'Sign in', href: '/login' },
  ];

  const legal: FooterLink[] = [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cookies', href: '/cookies' },
  ];

  return (
    <footer className="relative bg-espresso-950 text-espresso-200/70 overflow-hidden">
      {/* Gold hairline at the top of the footer */}
      <div
        aria-hidden="true"
        className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary-500/40 to-transparent"
      />

      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-80 h-80 bg-espresso-600 rounded-full blur-3xl" />
      </div>

      <div className="container-custom py-16 relative">
        {/* Top: brand + links grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="md:col-span-3 lg:col-span-5">
            <Logo className="mb-5" size="md" />

            <p className="text-sm leading-relaxed text-espresso-200/70 max-w-sm">
              Book trusted braiding and beauty salons across the UK. Preview
              styles on your photo with AI, then shop premium wigs and
              accessories — all in one place.
            </p>

            <div className="flex items-center gap-2 mt-6 text-xs text-espresso-300/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Made and hosted in the UK</span>
            </div>
          </div>

          {/* Discover links */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-semibold mb-5 text-xs uppercase tracking-[0.15em]">
              Discover
            </h4>
            <ul className="space-y-3 text-sm">
              {discoverLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center text-espresso-200/70 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-5 text-xs uppercase tracking-[0.15em]">
              My account
            </h4>
            <ul className="space-y-3 text-sm">
              {myAccountLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center text-espresso-200/70 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Try-On promo */}
          
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.08] mt-14 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-espresso-300/60">
            © {year} KrownBraids. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            {legal.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-espresso-300/60 hover:text-primary-400 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}