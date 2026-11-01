'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ServiceCard from '../../components/ServiceCard';
import { Salon, Service } from '../../../lib/types';
import { resolveImageUrl } from '../../../lib/imageUrl';
import Link from 'next/link';
import { MapPin, Mail, Globe, Clock } from 'lucide-react';

export default function SalonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Track image errors so we can fall back gracefully per-image
  const [coverError, setCoverError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);

      try {
        const [salonRes, servicesRes] = await Promise.all([
          fetch(`/api/auth/salons/${id}`, { cache: 'no-store' }),
          fetch(`/api/auth/services/salon/${id}`, { cache: 'no-store' }),
        ]);

        if (!salonRes.ok) {
          setNotFound(true);
          return;
        }

        const salonData = await salonRes.json();
        setSalon(salonData);

        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          const list = Array.isArray(servicesData)
            ? servicesData
            : servicesData.data ?? [];
          setServices(list);
        } else {
          setServices([]);
        }
      } catch (err) {
        console.error('Failed to load salon:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  /* -------------------------------------------------------------- */
  /*  Loading                                                        */
  /* -------------------------------------------------------------- */

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-cream-50 py-12 px-4">
          <div className="container-custom text-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-plum-200 border-t-plum-700 mx-auto" />
            <p className="text-ink-500 mt-4 text-sm">Loading salon…</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  /* -------------------------------------------------------------- */
  /*  Not found                                                      */
  /* -------------------------------------------------------------- */

  if (notFound || !salon) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-cream-50 py-12 px-4">
          <div className="container-custom max-w-md mx-auto text-center py-24">
            <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-plum-50 border border-plum-100 flex items-center justify-center text-3xl">
              🔍
            </div>
            <h1 className="text-2xl font-display font-bold text-ink-900">
              Salon not found
            </h1>
            <p className="text-ink-500 mt-2 text-sm">
              This salon doesn&apos;t exist or isn&apos;t available right now.
            </p>
            <Link
              href="/salons"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-plum-700 text-white font-medium text-sm rounded-xl hover:bg-plum-800 hover:shadow-lg hover:shadow-plum-700/25 transition-all"
            >
              Back to salons
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  /* -------------------------------------------------------------- */
  /*  Loaded                                                         */
  /* -------------------------------------------------------------- */

  const initial = salon.name.charAt(0).toUpperCase();
  const fullAddress = [
    salon.address,
    salon.city,
    salon.state,
    salon.postalCode,
    salon.country,
  ]
    .filter(Boolean)
    .join(', ');

  const coverSrc = resolveImageUrl(salon.coverImageUrl);
  const logoSrc = resolveImageUrl(salon.logoUrl);

  const showCover = Boolean(coverSrc) && !coverError;
  const showLogo = Boolean(logoSrc) && !logoError;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-cream-50">
        <div className="container-custom pt-8">
          <Link
            href="/salons"
            className="inline-flex items-center text-sm text-plum-700 hover:text-plum-800 font-medium transition-colors"
          >
            ← Back to salons
          </Link>
        </div>

        <section className="container-custom py-6">
          <div className="bg-white rounded-3xl border border-cream-200 overflow-hidden shadow-[0_12px_40px_-20px_rgba(122,38,65,0.15)]">
            {/* Hero banner — real cover image with gradient fallback */}
            <div className="relative h-40 sm:h-56 md:h-64 bg-gradient-to-br from-rose-brand-100 via-plum-100 to-plum-200 overflow-hidden">
              {showCover ? (
                <>
                  <Image
                    src={coverSrc}
                    alt={`${salon.name} cover`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 1200px"
                    onError={() => setCoverError(true)}
                    priority
                    unoptimized
                  />
                  {/* Subtle scrim for text/logo contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-plum-900/30 via-transparent to-transparent" />
                </>
              ) : (
                <>
                  <div
                    className="absolute inset-0 opacity-[0.25] mix-blend-soft-light"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 1px 1px, #7a2641 1px, transparent 0)',
                      backgroundSize: '24px 24px',
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-7xl sm:text-8xl font-display font-bold text-plum-700/30 select-none">
                      {initial}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 sm:p-8">
              {/* Logo + name row */}
              <div className="flex items-start gap-4">
                {showLogo ? (
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white border border-cream-200 shadow-md flex-shrink-0 -mt-10 sm:-mt-12 ring-4 ring-white">
                    <Image
                      src={logoSrc}
                      alt={`${salon.name} logo`}
                      fill
                      className="object-cover"
                      sizes="64px"
                      onError={() => setLogoError(true)}
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-white border border-cream-200 shadow-md flex-shrink-0 -mt-10 sm:-mt-12 ring-4 ring-white flex items-center justify-center">
                    <span className="text-2xl font-display font-bold text-plum-700">
                      {initial}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0 pt-1">
                  <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink-900 truncate">
                    {salon.name}
                  </h1>
                </div>
              </div>

              {salon.description && (
                <p className="text-ink-600 mt-4 max-w-2xl leading-relaxed">
                  {salon.description}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {fullAddress && (
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-xl bg-plum-50 border border-plum-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-plum-700" />
                    </span>
                    <p className="text-sm text-ink-700 pt-2 leading-snug">
                      {fullAddress}
                    </p>
                  </div>
                )}

                {salon.email && (
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-xl bg-plum-50 border border-plum-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-plum-700" />
                    </span>
                    <a
                      href={`mailto:${salon.email}`}
                      className="text-sm font-medium text-ink-700 hover:text-plum-700 transition-colors pt-2 truncate"
                    >
                      {salon.email}
                    </a>
                  </div>
                )}

                {salon.website && (
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-xl bg-plum-50 border border-plum-100 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-4 h-4 text-plum-700" />
                    </span>
                    <a
                      href={salon.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-ink-700 hover:text-plum-700 transition-colors pt-2 truncate"
                    >
                      {salon.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="container-custom pb-16">
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-[0.15em] text-rose-brand-600 uppercase mb-2">
              Menu
            </p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink-900">
              Services
            </h2>
            <p className="text-sm text-ink-500 mt-1">
              {services.length}{' '}
              {services.length === 1 ? 'service' : 'services'} available
            </p>
          </div>

          {services.length === 0 ? (
            <div className="bg-white rounded-3xl border border-cream-200 p-12 text-center shadow-[0_12px_40px_-20px_rgba(122,38,65,0.12)]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-plum-50 border border-plum-100 flex items-center justify-center">
                <Clock className="w-7 h-7 text-plum-400" />
              </div>
              <p className="text-ink-700 font-medium">No services listed yet</p>
              <p className="text-sm text-ink-500 mt-2">
                This salon hasn&apos;t added services yet. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  salonId={salon.id}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}