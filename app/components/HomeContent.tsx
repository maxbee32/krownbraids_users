'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Toaster } from 'react-hot-toast';
import {
  ArrowRight,
  Search,
  X,
  Check,
  Scissors,
  MapPin,
  Wand2,
} from 'lucide-react';
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

  const handleSearchSubmit = () => {
    const q = searchTerm.trim();
    router.push(q ? `/salons?q=${encodeURIComponent(q)}` : '/salons');
  };

  const popularSearches = [
    { label: 'Braids', type: 'style' as const },
    { label: 'Knotless', type: 'style' as const },
    { label: 'London', type: 'city' as const },
    { label: 'Manchester', type: 'city' as const },
  ];

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
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-b from-rose-brand-50/50 via-cream-50 to-cream-50" />
          <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[1200px] h-[1000px] opacity-[0.35]">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-brand-200 via-plum-100 to-transparent blur-3xl" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[520px] opacity-[0.18]">
            <div className="absolute inset-0 rounded-[50%] bg-gradient-to-tr from-plum-300 via-rose-brand-200 to-transparent blur-3xl" />
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[760px] h-[380px] opacity-[0.22]">
            <div className="absolute inset-0 rounded-[50%] bg-gradient-to-t from-rose-brand-200 to-transparent blur-2xl" />
          </div>
          <div
            className="absolute inset-0 opacity-[0.35] mix-blend-soft-light"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, #7a2641 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="relative container-custom py-16 sm:py-20 md:py-24 lg:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-ink-900 leading-[1.1] tracking-tight">
              Find a salon
              <br />
              <span className="bg-gradient-to-r from-plum-700 via-rose-brand-600 to-plum-700 bg-clip-text text-transparent">
                near you.
              </span>
            </h1>

            <p className="mt-5 sm:mt-6 text-sm sm:text-base md:text-lg text-ink-500 max-w-xl mx-auto leading-relaxed px-2">
              Discover trusted braiding and beauty salons across the UK —
              search by name, town, or postcode.
            </p>

            <div className="mt-8 sm:mt-10 max-w-xl mx-auto px-1">
              <div className="relative group">
                <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-ink-400 group-focus-within:text-plum-700 transition-colors pointer-events-none z-10" />

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
                  className="w-full pl-11 sm:pl-14 pr-4 sm:pr-32 py-3.5 sm:py-5 bg-white border border-cream-200 rounded-2xl text-ink-900 placeholder-ink-400 shadow-[0_8px_28px_-10px_rgba(122,38,65,0.18)] focus:border-plum-300 focus:ring-4 focus:ring-plum-100 transition-all outline-none text-sm sm:text-base"
                />

                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 sm:right-[110px] top-1/2 -translate-y-1/2 p-1.5 hover:bg-cream-100 rounded-full transition-colors z-10"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4 text-ink-500" />
                  </button>
                )}

                <button
                  onClick={handleSearchSubmit}
                  className="hidden sm:block absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3.5 bg-plum-700 text-white text-sm font-semibold rounded-xl hover:bg-plum-800 transition-colors shadow-sm z-10"
                >
                  Search
                </button>
              </div>

              <button
                onClick={handleSearchSubmit}
                className="mt-3 w-full sm:hidden py-3.5 bg-plum-700 text-white text-sm font-semibold rounded-xl hover:bg-plum-800 transition-colors shadow-sm"
              >
                Search
              </button>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <span className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">
                  Popular searches
                </span>

                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                  {popularSearches.map((tag) => (
                    <button
                      key={tag.label}
                      onClick={() => {
                        setSearchTerm(tag.label);
                        router.push(`/salons?q=${encodeURIComponent(tag.label)}`);
                      }}
                      className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-cream-200 text-ink-600 hover:bg-plum-50 hover:text-plum-700 hover:border-plum-300 transition-all shadow-sm hover:shadow"
                    >
                      {tag.type === 'style' ? (
                        <Scissors className="w-3 h-3 text-rose-brand-500 group-hover:text-plum-600 transition-colors" />
                      ) : (
                        <MapPin className="w-3 h-3 text-rose-brand-500 group-hover:text-plum-600 transition-colors" />
                      )}
                      <span className="text-xs font-medium">{tag.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturedServices />

      {/* ─────────── SALONS ─────────── */}
      <section className="container-custom py-12 sm:py-16">
        <div className="flex items-end justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-rose-brand-600 uppercase mb-2">
              {searchTerm ? 'Results' : 'Discover'}
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-ink-900">
              {searchTerm ? 'Search results' : 'Featured salons'}
            </h2>
            <p className="text-xs sm:text-sm text-ink-500 mt-1.5 sm:mt-2">
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
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-plum-700 hover:text-plum-800 font-medium transition-colors flex-shrink-0"
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
          <div className="text-center py-20 sm:py-24 px-4">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-plum-50 border border-plum-100 flex items-center justify-center">
              <Search className="w-7 h-7 text-plum-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-display font-semibold text-ink-900">
              {searchTerm ? 'No salons found' : 'No salons yet'}
            </h3>
            <p className="text-ink-500 mt-2 max-w-sm mx-auto text-sm">
              {searchTerm
                ? 'Try a different name, town, or postcode.'
                : 'Check back soon — new salons are joining every week.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredSalons.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        )}
      </section>

      {/* ─────────── STYLE PREVIEW SHOWCASE ─────────── */}
      <section className="container-custom pb-16 sm:pb-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-plum-900">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-40 -right-20 w-[500px] h-[500px] rounded-full bg-rose-brand-500/25 blur-3xl" />
            <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full bg-plum-400/20 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '28px 28px',
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                backgroundSize: '80px 80px',
              }}
            />
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-6 sm:p-10 lg:p-16 items-center">
            {/* LEFT — copy */}
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-white leading-[1.05] tracking-tight">
                See it on{' '}
                <span className="bg-gradient-to-r from-rose-brand-300 via-rose-brand-200 to-plum-200 bg-clip-text text-transparent">
                  you.
                </span>
                <br />
                <span className="text-plum-200/90">Before you commit.</span>
              </h2>

              <p className="mt-5 sm:mt-6 text-sm sm:text-base text-plum-100/70 max-w-md leading-relaxed">
                Stop guessing which braids will suit you. Upload a photo, pick
                a style, and preview the result — no booking required, no
                pressure.
              </p>

              <div className="mt-7 sm:mt-9 grid grid-cols-2 gap-3 sm:gap-4 max-w-md">
                {[
                  { label: 'Any photo', desc: 'Upload or use camera' },
                  { label: 'Fast preview', desc: 'Results in seconds' },
                  { label: 'Save to gallery', desc: 'Keep your favourites' },
                  { label: 'No commitment', desc: 'No booking required' },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                  >
                    <div className="w-1 h-full min-h-[2rem] rounded-full bg-gradient-to-b from-rose-brand-400 to-plum-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] sm:text-xs font-semibold text-white leading-tight">
                        {f.label}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-white/50 mt-0.5 leading-tight">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 sm:mt-10">
                <button
                  onClick={() => setShowAITryOn(true)}
                  className="group inline-flex items-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 bg-gradient-to-r from-white to-plum-50 text-plum-900 font-semibold rounded-2xl shadow-2xl shadow-black/20 hover:shadow-3xl hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm sm:text-base"
                >
                  <Wand2 className="w-4 h-4 text-rose-brand-500 group-hover:rotate-12 transition-transform" />
                  Preview a style
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <p className="mt-3 text-[11px] text-white/40 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  Takes ~10 seconds.
                </p>
              </div>
            </div>

            {/* RIGHT — visual */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative mx-auto w-full max-w-[380px]">
                <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-rose-brand-500/30 via-plum-400/20 to-transparent blur-2xl" />

                <div className="relative aspect-[3/4] rounded-[1.5rem] overflow-hidden border-2 border-white/15 shadow-2xl shadow-black/40">
                  <Image
                    src="/assets/img/Braided Beauty Salon Selfie.png"
                    alt="Style preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 90vw, 380px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-plum-900/60 via-transparent to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[10px] uppercase tracking-wider text-white/60 font-semibold mb-0.5">
                      Style preview
                    </p>
                    <p className="text-sm font-display font-bold text-white">
                      Sleek Knotless Braids
                    </p>
                  </div>
                </div>

                <div className="absolute -bottom-5 -right-3 sm:-right-6 bg-white rounded-2xl shadow-2xl shadow-plum-900/30 p-3 sm:p-4 flex items-center gap-3 border border-cream-200 w-[200px] sm:w-[220px]">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                  </div>
                  <div className="leading-tight min-w-0">
                    <p className="text-[9px] text-ink-500 font-medium uppercase tracking-wide">
                      Style match
                    </p>
                    <p className="text-xs font-semibold text-ink-900 truncate">
                      Looks great on you
                    </p>
                  </div>
                </div>
              </div>
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