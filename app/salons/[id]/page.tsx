// app/salons/[id]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ServiceCard from '../../components/ServiceCard';
import { Salon, Service } from '../../../lib/types';
import { resolveImageUrl } from '../../../lib/imageUrl';
import Link from 'next/link';
import {
  MapPin,
  Mail,
  Globe,
  Clock,
  ArrowLeft,
  Check,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';

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

  // Accordion state for policies
  const [openPolicy, setOpenPolicy] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);

      try {
        const [salonRes, servicesRes] = await Promise.all([
          fetch(`/api/auth/salons/public/${id}`, { cache: 'no-store' }),
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

  /* ─── Loading ─── */
  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-espresso-50 py-12 px-4">
          <div className="container-custom text-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-espresso-200 border-t-primary-500 mx-auto" />
            <p className="text-espresso-500 mt-4 text-sm font-medium">
              Loading salon…
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  /* ─── Not found ─── */
  if (notFound || !salon) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-espresso-50 py-12 px-4">
          <div className="container-custom max-w-md mx-auto text-center py-24">
            <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-white border border-espresso-200 flex items-center justify-center text-3xl shadow-sm">
              🔍
            </div>
            <h1 className="text-2xl font-display font-bold text-espresso-950">
              Salon not found
            </h1>
            <p className="text-espresso-500 mt-2 text-sm">
              This salon doesn&apos;t exist or isn&apos;t available right now.
            </p>
            <Link
              href="/salons"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-espresso-950 text-white font-medium text-sm rounded-xl hover:bg-espresso-800 transition-all shadow-md"
            >
              Back to salons
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  /* ─── Loaded ─── */
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
  // Only show the logo if there is actually a URL AND it hasn't errored
  const showLogo = Boolean(logoSrc) && !logoError;

  // Parse opening hours (comes as a Map from the backend)
  const openingHoursEntries =
    salon.openingHours && typeof salon.openingHours === 'object'
      ? Object.entries(salon.openingHours)
      : [];

  // Check if any policy exists
  const hasPolicies =
    Boolean(salon.termsAndConditions) ||
    Boolean(salon.privacyPolicy) ||
    Boolean(salon.cancellationPolicy);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-espresso-50">
        {/* Back Link */}
        <div className="container-custom pt-8 pb-4">
          <Link
            href="/salons"
            className="inline-flex items-center gap-2 text-sm text-espresso-500 hover:text-primary-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to salons
          </Link>
        </div>

        {/* ─── Hero Section ─── */}
        <section className="container-custom pb-8">
          <div className="bg-white rounded-3xl border border-espresso-100 overflow-hidden shadow-[0_20px_60px_-15px_rgba(42,34,31,0.15)]">
            {/* Cover Image */}
            <div className="relative h-56 sm:h-72 md:h-96 bg-espresso-100 overflow-hidden">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/90 via-espresso-950/40 to-transparent" />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-espresso-50">
                  <span className="text-8xl font-display font-bold text-espresso-200/50">
                    {initial}
                  </span>
                </div>
              )}

              {/* Text over the cover image */}
              <div className="absolute bottom-6 left-6 sm:left-10 right-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-[10px] font-bold uppercase tracking-wider text-white">
                    <Check
                      className="w-3 h-3 text-primary-400"
                      strokeWidth={3}
                    />
                    Verified Salon
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white drop-shadow-lg">
                  {salon.name}
                </h1>
              </div>
            </div>

            {/* Salon Details */}
            <div className="p-6 sm:p-10">
              <div className="flex flex-col md:flex-row gap-8 md:gap-10">
                {/* Left Col: Description & Contact */}
                <div className="flex-1 space-y-8">
                  <div>
                    <h2 className="text-xl font-display font-bold text-espresso-950 mb-3">
                      About
                    </h2>
                    <p className="text-espresso-600 text-base leading-relaxed">
                      {salon.description || 'No description provided.'}
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-display font-bold text-espresso-950 mb-4">
                      Contact &amp; Location
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {fullAddress && (
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-espresso-50 border border-espresso-100">
                          <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-espresso-400 uppercase tracking-wider mb-1">
                              Location
                            </p>
                            <p className="text-sm font-medium text-espresso-900 leading-snug">
                              {fullAddress}
                            </p>
                          </div>
                        </div>
                      )}

                      {salon.email && (
                        <a
                          href={`mailto:${salon.email}`}
                          className="flex items-start gap-3 p-4 rounded-2xl bg-espresso-50 border border-espresso-100 hover:border-primary-300 hover:bg-white transition-all group"
                        >
                          <Mail className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-espresso-400 uppercase tracking-wider mb-1 group-hover:text-primary-600 transition-colors">
                              Email
                            </p>
                            <p className="text-sm font-medium text-espresso-900 truncate">
                              {salon.email}
                            </p>
                          </div>
                        </a>
                      )}

                      {salon.website && (
                        <a
                          href={salon.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 p-4 rounded-2xl bg-espresso-50 border border-espresso-100 hover:border-primary-300 hover:bg-white transition-all group"
                        >
                          <Globe className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-espresso-400 uppercase tracking-wider mb-1 group-hover:text-primary-600 transition-colors">
                              Website
                            </p>
                            <p className="text-sm font-medium text-espresso-900 truncate">
                              {salon.website.replace(/^https?:\/\//, '')}
                            </p>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Col: Logo & Opening Hours */}
                <div className="w-full md:w-72 flex-shrink-0 space-y-6">
                  
                  {/* ✅ Logo Badge — Only renders if the salon has a logo */}
                  {showLogo && (
                    <div className="w-full aspect-square rounded-3xl overflow-hidden bg-white border border-espresso-100 shadow-xl relative hidden md:block">
                      <Image
                        src={logoSrc}
                        alt={`${salon.name} logo`}
                        fill
                        className="object-cover"
                        sizes="160px"
                        onError={() => setLogoError(true)}
                        unoptimized
                      />
                    </div>
                  )}

                  {/* Opening Hours Widget */}
                  {openingHoursEntries.length > 0 && (
                    <div className="bg-espresso-900 rounded-3xl p-6 text-white shadow-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-primary-500" />
                        <h3 className="font-display font-bold text-lg">
                          Opening Hours
                        </h3>
                      </div>
                      <ul className="space-y-2 text-sm">
                        {openingHoursEntries.map(([day, hours]) => (
                          <li
                            key={day}
                            className="flex justify-between items-center py-1 border-b border-white/10 last:border-0"
                          >
                            <span className="text-espresso-300">{day}</span>
                            <span className="font-medium text-white">
                              {String(hours)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Services Section ─── */}
        <section className="container-custom pb-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-primary-600 uppercase mb-2">
                Book an appointment
              </p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-espresso-950">
                Services
              </h2>
            </div>
            <p className="text-sm font-medium text-espresso-500 bg-white px-3 py-1 rounded-full border border-espresso-200 shadow-sm">
              {services.length}{' '}
              {services.length === 1 ? 'service' : 'services'}
            </p>
          </div>

          {services.length === 0 ? (
            <div className="bg-white rounded-3xl border border-espresso-100 p-16 text-center shadow-sm">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-espresso-50 flex items-center justify-center">
                <Clock className="w-10 h-10 text-espresso-300" />
              </div>
              <h3 className="text-xl font-display font-bold text-espresso-950 mb-2">
                No services listed yet
              </h3>
              <p className="text-sm text-espresso-500 max-w-sm mx-auto">
                This salon hasn&apos;t added their services yet. Please check
                back soon or contact them directly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* ─── Policies Section ─── */}
        {hasPolicies && (
          <section className="container-custom pb-20">
            <div className="bg-white rounded-3xl border border-espresso-100 overflow-hidden shadow-sm">
              <div className="p-6 sm:p-8 border-b border-espresso-100 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-primary-500" />
                <h2 className="text-xl font-display font-bold text-espresso-950">
                  Salon Policies
                </h2>
              </div>

              <div className="divide-y divide-espresso-100">
                {/* Cancellation Policy */}
                {salon.cancellationPolicy && (
                  <PolicyAccordion
                    title="Cancellation Policy"
                    content={salon.cancellationPolicy}
                    isOpen={openPolicy === 'cancellation'}
                    onToggle={() =>
                      setOpenPolicy(
                        openPolicy === 'cancellation' ? null : 'cancellation'
                      )
                    }
                  />
                )}

                {/* Terms & Conditions */}
                {salon.termsAndConditions && (
                  <PolicyAccordion
                    title="Terms & Conditions"
                    content={salon.termsAndConditions}
                    isOpen={openPolicy === 'terms'}
                    onToggle={() =>
                      setOpenPolicy(openPolicy === 'terms' ? null : 'terms')
                    }
                  />
                )}

                {/* Privacy Policy */}
                {salon.privacyPolicy && (
                  <PolicyAccordion
                    title="Privacy Policy"
                    content={salon.privacyPolicy}
                    isOpen={openPolicy === 'privacy'}
                    onToggle={() =>
                      setOpenPolicy(openPolicy === 'privacy' ? null : 'privacy')
                    }
                  />
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

/* ─── Reusable Accordion Component for Policies ─── */
function PolicyAccordion({
  title,
  content,
  isOpen,
  onToggle,
}: {
  title: string;
  content: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="group">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-espresso-50 transition-colors text-left"
      >
        <span className="font-semibold text-espresso-900">{title}</span>
        <ChevronDown
          className={`w-5 h-5 text-espresso-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`px-6 overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[1000px] pb-6 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="prose prose-sm text-espresso-600 whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  );
}