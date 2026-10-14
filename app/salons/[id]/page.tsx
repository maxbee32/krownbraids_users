'use client';

import { useState, useEffect, use } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ServiceCard from '../../components/ServiceCard';
import { Salon, Service } from '../../../lib/types';
import Link from 'next/link';
import { MapPin, Phone, Mail, Globe, Clock } from 'lucide-react';

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
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 mx-auto" />
            <p className="text-gray-500 mt-4 text-sm">Loading salon…</p>
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
            <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-cream-100 border border-cream-200 flex items-center justify-center text-3xl">
              🔍
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900">
              Salon not found
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              This salon doesn&apos;t exist or isn&apos;t available right now.
            </p>
            <Link
              href="/salons"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium text-sm rounded-xl hover:shadow-lg hover:shadow-primary-700/25 transition-all"
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

  return (
    <>
      <Header />

      <main className="min-h-screen bg-cream-50">
        <div className="container-custom pt-8">
          <Link
            href="/salons"
            className="inline-flex items-center text-sm text-primary-700 hover:text-primary-800 font-medium transition-colors"
          >
            ← Back to salons
          </Link>
        </div>

        <section className="container-custom py-6">
          <div className="bg-cream-25 rounded-3xl border border-cream-200 overflow-hidden">
            <div className="relative h-40 sm:h-56 bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 flex items-center justify-center">
              <span className="text-7xl sm:text-8xl font-display font-bold text-primary-700/30 select-none">
                {initial}
              </span>
            </div>

            <div className="p-6 sm:p-8">
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900">
                {salon.name}
              </h1>

              {salon.description && (
                <p className="text-gray-600 mt-3 max-w-2xl leading-relaxed">
                  {salon.description}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {fullAddress && (
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-primary-700" />
                    </span>
                    <p className="text-sm text-gray-700 pt-2 leading-snug">
                      {fullAddress}
                    </p>
                  </div>
                )}

                {salon.phoneNumber && (
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-primary-700" />
                    </span>
                    <a
                      href={`tel:${salon.phoneNumber}`}
                      className="text-sm font-medium text-gray-700 hover:text-primary-700 transition-colors pt-2"
                    >
                      {salon.phoneNumber}
                    </a>
                  </div>
                )}

                {salon.email && (
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-primary-700" />
                    </span>
                    <a
                      href={`mailto:${salon.email}`}
                      className="text-sm font-medium text-gray-700 hover:text-primary-700 transition-colors pt-2 truncate"
                    >
                      {salon.email}
                    </a>
                  </div>
                )}

                {salon.website && (
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-4 h-4 text-primary-700" />
                    </span>
                    <a
                      href={salon.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-gray-700 hover:text-primary-700 transition-colors pt-2 truncate"
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
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
              Services
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {services.length}{' '}
              {services.length === 1 ? 'service' : 'services'} available
            </p>
          </div>

          {services.length === 0 ? (
            <div className="bg-cream-25 rounded-3xl border border-cream-200 p-12 text-center">
              <Clock className="w-12 h-12 text-cream-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No services listed yet</p>
              <p className="text-sm text-gray-400 mt-2">
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