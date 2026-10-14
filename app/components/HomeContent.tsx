'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Toaster } from 'react-hot-toast';
import { Camera, Sparkles, ArrowRight, Search, X, Check } from 'lucide-react';
import SalonCard from './SalonCard';
import MarketplaceSection from './MarketplaceSection';
import AITryOn from './AITryOn';
import { Salon } from '../../lib/types';
import FeaturedServices from './FeaturedServices';

export default function HomeContent() {
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

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1c1917',
            color: '#fff',
            borderRadius: '12px',
            padding: '14px 16px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#d97706', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />

      {/* ─────────── HERO ─────────── */}
      <section className="bg-gradient-to-b from-white to-stone-50 border-b border-stone-200">
        <div className="container-custom py-16 sm:py-20 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-xs font-medium text-stone-600 tracking-wide uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              UK braiding &amp; beauty salons
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-ink-900 leading-[1.1] tracking-tight">
              Find a salon near you.
              <br />
              <span className="text-stone-400">Book in seconds.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-stone-600 max-w-xl mx-auto leading-relaxed">
              Discover trusted braiding and beauty salons across the UK — search by name,
              town, or postcode.
            </p>

            {/* Search bar */}
            <div className="mt-10 max-w-xl mx-auto">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-ink-700 transition-colors pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search salons, towns, or postcodes…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-white border border-stone-200 rounded-2xl text-ink-900 placeholder-stone-400 shadow-sm focus:border-ink-700 focus:ring-4 focus:ring-ink-700/5 transition-all outline-none text-sm sm:text-base"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-stone-100 rounded-full transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4 text-stone-500" />
                  </button>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-stone-500">Popular:</span>
                {['Braids', 'Knotless', 'London', 'Manchester'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="px-3 py-1 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-ink-800 transition-colors"
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
            <p className="text-xs font-semibold tracking-[0.15em] text-amber-700 uppercase mb-2">
              {searchTerm ? 'Results' : 'Discover'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-ink-900">
              {searchTerm ? 'Search results' : 'Featured salons'}
            </h2>
            <p className="text-sm text-stone-600 mt-2">
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
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-ink-700 hover:text-ink-900 font-medium transition-colors"
            >
              Clear search
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-stone-200 border-t-ink-800 mx-auto" />
            <p className="text-stone-500 mt-4 text-sm">Loading salons…</p>
          </div>
        ) : filteredSalons.length === 0 ? (
          <div className="text-center py-24 px-4">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center">
              <Search className="w-7 h-7 text-stone-400" />
            </div>
            <h3 className="text-xl font-display font-semibold text-ink-900">
              {searchTerm ? 'No salons found' : 'No salons yet'}
            </h3>
            <p className="text-stone-600 mt-2 max-w-sm mx-auto text-sm">
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
        <div className="relative overflow-hidden rounded-3xl bg-ink-900 text-white">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-stone-700 rounded-full blur-3xl translate-y-1/2" />
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

              <h2 className="text-3xl sm:text-4xl font-display font-bold leading-tight">
                Try styles on
                <br />
                <span className="text-amber-400">before you book.</span>
              </h2>

              <p className="mt-4 text-stone-300 max-w-md leading-relaxed">
                Upload a photo and see how different braiding styles look on you —
                no guessing, no disappointment.
              </p>

              <div className="mt-8">
                <button
                  onClick={() => setShowAITryOn(true)}
                  className="group inline-flex items-center gap-2 px-6 py-3.5 bg-white text-ink-900 font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm"
                >
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Try it now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right — real image + result badge */}
            <div className="md:col-span-2 hidden md:block relative">
              {/* Real photo — tilted slightly for a candid feel */}
              <div className="relative w-full max-w-[280px] mx-auto aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl rotate-2 border-4 border-white/10">
                <Image
                  src="/assets/img/Braided Beauty Salon Selfie.png"
                  alt="Try on braiding styles with your photo"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 280px"
                />
              </div>

              {/* Result badge — floating over the bottom-left corner */}
              <div className="absolute -bottom-4 -left-2 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="leading-tight">
                  <p className="text-[10px] text-stone-500 font-medium uppercase tracking-wide">
                    Match found
                  </p>
                  <p className="text-xs font-semibold text-ink-900">
                    Knotless Braids
                  </p>
                </div>
              </div>

              {/* Small sparkle accent */}
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>
      </section>

      <MarketplaceSection />

      {showAITryOn && (
  <div
    className="fixed inset-0 z-50 flex items-start justify-center p-0 sm:p-6 bg-ink-900/70 backdrop-blur-md overflow-y-auto animate-fadeIn"
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