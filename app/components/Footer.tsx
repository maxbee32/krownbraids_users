// app/components/Footer.tsx
import Link from 'next/link';
import { Logo } from '../components/ui/Logo';

interface FooterLink {
  label: string;
  href: string;
}

export default function Footer() {
  const year: number = new Date().getFullYear();

  const quickLinks: FooterLink[] = [
    { label: 'Browse salons', href: '/salons' },
    { label: 'About us', href: '/about' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Contact', href: '/contact' },
  ];

  const popularServices: FooterLink[] = [
    { label: 'Box braids', href: '/salons?q=box-braids' },
    { label: 'Knotless braids', href: '/salons?q=knotless' },
    { label: 'Cornrows', href: '/salons?q=cornrows' },
    { label: 'Dreadlocks', href: '/salons?q=dreadlocks' },
  ];

  const legal: FooterLink[] = [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cookies', href: '/cookies' },
  ];

  return (
    <footer className="relative bg-ink-900 text-stone-400 overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-80 h-80 bg-stone-500 rounded-full blur-3xl" />
      </div>

      <div className="container-custom py-16 relative">
        {/* Top: brand + links grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-5">
            <Logo variant="light" className="mb-5" />

            <p className="text-sm leading-relaxed text-stone-400 max-w-sm">
              The UK marketplace for braiding and beauty salons. Discover
              trusted stylists, book appointments, and preview styles before
              you commit.
            </p>

            <div className="flex items-center gap-2 mt-6 text-xs text-stone-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Made and hosted in the UK</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-semibold mb-5 text-xs uppercase tracking-[0.15em]">
              Explore
            </h4>
            <ul className="space-y-3 text-sm">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center text-stone-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular services */}
          <div className="lg:col-span-4">
            <h4 className="text-white font-semibold mb-5 text-xs uppercase tracking-[0.15em]">
              Popular styles
            </h4>
            <ul className="space-y-3 text-sm">
              {popularServices.map((service) => (
                <li key={service.label}>
                  <Link
                    href={service.href}
                    className="inline-flex items-center text-stone-400 hover:text-white transition-colors"
                  >
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] mt-14 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-stone-500">
            © {year} KrownBraids. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            {legal.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-stone-500 hover:text-white transition-colors"
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