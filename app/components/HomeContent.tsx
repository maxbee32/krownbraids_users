'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Toaster } from 'react-hot-toast';
import { Camera, Sparkles, ArrowRight, Search, X, Check } from 'lucide-react';
import SalonCard from './SalonCard';
import MarketplaceSection from './MarketplaceSection';
import AITryOn from './AITryOn';
import { Salon } from '../../lib/types';
import FeaturedServices from './FeaturedServices';

export default function HomeContent() {
  const router = useRouter();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAITryOn, setShowAITryOn] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/salons', { cache: 'no-store' });
        if (!res.ok) {
          setSalons([]);
          return;
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data ?? [];
        setSalons(list.filter((s: Salon) => s.status === 'ACTIVE'));
      } catch (err) {
        console.error('Failed to load salons:', err);
        setSalons([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredSalons = salons.filter((salon) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      salon.name?.toLowerCase().includes(term) ||
      salon.city?.toLowerCase().includes(term) ||
      salon.country?.toLowerCase().includes(term) ||
      salon.postalCode?.toLowerCase().includes(term)
    );
  });

  /* ---------------------------------------------------------------- */
  /*  Search handler — sends the term to /salons as a query param      */
  /* ---------------------------------------------------------------- */
  const handleSearchSubmit = () => {
    const q = searchTerm.trim();
    router.push(q ? `/salons?q=${encodeURIComponent(q)}` : '/salons');
  };

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#3d352e',
            color: '#fff',
            borderRadius: '12px',
            padding: '14px 16px',
            fontSize: '14px',
            fontFamily: 'Sora, system-ui, sans-serif',
          },
          success: {
            iconTheme: { primary: '#e11d48', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />

      {/* ─────────── HERO ─────────── */}
      <section className="relative bg-cream-50 border-b border-cream-200 overflow-hidden">
        {/* Soft layered gradients — rose → plum blooms */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {/* Base wash */}
          <div className="absolute inset-0 bg-gradient-to-b from-rose-brand-50/50 via-cream-50 to-cream-50" />

          {/* Rose bloom — top */}
          <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[1200px] h-[1000px] opacity-[0.35]">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-brand-200 via-plum-100 to-transparent blur-3xl" />
          </div>

          {/* Warm plum wave — middle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[520px] opacity-[0.18]">
            <div className="absolute inset-0 rounded-[50%] bg-gradient-to-tr from-plum-300 via-rose-brand-200 to-transparent blur-3xl" />
          </div>

          {/* Lower warm glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[760px] h-[380px] opacity-[0.22]">
            <div className="absolute inset-0 rounded-[50%] bg-gradient-to-t from-rose-brand-200 to-transparent blur-2xl" />
          </div>

          {/* Fine dot texture */}
          <div
            className="absolute inset-0 opacity-[0.35] mix-blend-soft-light"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, #7a2641 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative container-custom py-20 sm:py-28 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-plum-100 text-xs font-semibold text-plum-700 tracking-wide uppercase mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-brand-500" />
              UK braiding &amp; beauty salons
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-ink-900 leading-[1.05] tracking-tight">
              Find a salon
              <br />
              <span className="bg-gradient-to-r from-plum-700 via-rose-brand-600 to-plum-700 bg-clip-text text-transparent">
                near you.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-ink-500 max-w-xl mx-auto leading-relaxed">
              Discover trusted braiding and beauty salons across the UK —
              search by name, town, or postcode.
            </p>

            {/* Search bar */}
            <div className="mt-10 max-w-xl mx-auto">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400 group-focus-within:text-plum-700 transition-colors pointer-events-none z-10" />

                <input
                  type="text"
                  placeholder="Search salons, towns, or postcodes…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchSubmit();
                    }
                  }}
                  className="w-full pl-14 pr-32 py-5 bg-white border border-cream-200 rounded-2xl text-ink-900 placeholder-ink-400 shadow-[0_8px_28px_-10px_rgba(122,38,65,0.18)] focus:border-plum-300 focus:ring-4 focus:ring-plum-100 transition-all outline-none text-sm sm:text-base"
                />

                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-[110px] top-1/2 -translate-y-1/2 p-1.5 hover:bg-cream-100 rounded-full transition-colors z-10"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4 text-ink-500" />
                  </button>
                )}

                <button
                  onClick={handleSearchSubmit}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3.5 bg-plum-700 text-white text-sm font-semibold rounded-xl hover:bg-plum-800 transition-colors shadow-sm z-10"
                >
                  Search
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-ink-500">Popular:</span>
                {['Braids', 'Knotless', 'London', 'Manchester'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchTerm(tag);
                      router.push(`/salons?q=${encodeURIComponent(tag)}`);
                    }}
                    className="px-3 py-1 rounded-full bg-white border border-cream-200 text-ink-600 hover:bg-plum-50 hover:text-plum-700 hover:border-plum-200 transition-colors shadow-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturedServices />

      {/* ─────────── SALONS ─────────── */}
      <section className="container-custom py-12 sm:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-rose-brand-600 uppercase mb-2">
              {searchTerm ? 'Results' : 'Discover'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-ink-900">
              {searchTerm ? 'Search results' : 'Featured salons'}
            </h2>
            <p className="text-sm text-ink-500 mt-2">
              {loading
                ? 'Loading salons…'
                : `${filteredSalons.length} ${
                    filteredSalons.length === 1 ? 'salon' : 'salons'
                  } available${searchTerm ? ` for "${searchTerm}"` : ''}`}
            </p>
          </div>

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-plum-700 hover:text-plum-800 font-medium transition-colors"
            >
              Clear search
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-cream-200 border-t-plum-700 mx-auto" />
            <p className="text-ink-500 mt-4 text-sm">Loading salons…</p>
          </div>
        ) : filteredSalons.length === 0 ? (
          <div className="text-center py-24 px-4">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-plum-50 border border-plum-100 flex items-center justify-center">
              <Search className="w-7 h-7 text-plum-400" />
            </div>
            <h3 className="text-xl font-display font-semibold text-ink-900">
              {searchTerm ? 'No salons found' : 'No salons yet'}
            </h3>
            <p className="text-ink-500 mt-2 max-w-sm mx-auto text-sm">
              {searchTerm
                ? 'Try a different name, town, or postcode.'
                : 'Check back soon — new salons are joining every week.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSalons.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        )}
      </section>

      {/* ─────────── TRY-ON BANNER ─────────── */}
      <section className="container-custom pb-12">
        <div className="relative overflow-hidden rounded-3xl bg-plum-900 text-white">
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-brand-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-plum-400 rounded-full blur-3xl translate-y-1/2" />
          </div>

          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative grid grid-cols-1 md:grid-cols-5 gap-8 p-8 sm:p-10 md:p-12 items-center">
            {/* Left — copy */}
            <div className="md:col-span-3">
              <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium tracking-wide uppercase mb-5">
                <Camera className="w-3.5 h-3.5" />
                Photo preview
              </div>

              <h2 className="text-3xl sm:text-4xl font-display font-bold leading-tight text-white">
                Try styles on
                <br />
                <span className="text-rose-brand-300">before you book.</span>
              </h2>

              <p className="mt-4 text-plum-100/80 max-w-md leading-relaxed">
                Upload a photo and see how different braiding styles look on
                you — no guessing, no disappointment.
              </p>

              <div className="mt-8">
                <button
                  onClick={() => setShowAITryOn(true)}
                  className="group inline-flex items-center gap-2 px-6 py-3.5 bg-white text-plum-900 font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm"
                >
                  <Sparkles className="w-4 h-4 text-rose-brand-500 group-hover:rotate-12 transition-transform" />
                  Try it now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right — real image + result badge */}
            <div className="md:col-span-2 hidden md:block relative">
              <div className="relative w-full max-w-[280px] mx-auto aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl rotate-2 border-4 border-white/10">
                <Image
                  src="/assets/img/Braided Beauty Salon Selfie.png"
                  alt="Try on braiding styles with your photo"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 280px"
                />
              </div>

              <div className="absolute -bottom-4 -left-2 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="leading-tight">
                  <p className="text-[10px] text-ink-500 font-medium uppercase tracking-wide">
                    Match found
                  </p>
                  <p className="text-xs font-semibold text-ink-900">
                    Knotless Braids
                  </p>
                </div>
              </div>

              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-rose-brand-300" />
            </div>
          </div>
        </div>
      </section>

      <MarketplaceSection />

      {showAITryOn && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-0 sm:p-6 bg-plum-900/70 backdrop-blur-md overflow-y-auto animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAITryOn(false);
          }}
        >
          <div className="w-full max-w-5xl my-0 sm:my-6 animate-slideUp">
            <AITryOn onClose={() => setShowAITryOn(false)} />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </>
  );
}