'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Toaster } from 'react-hot-toast';
import {
  ArrowRight,
  Search,
  X,
  Check,
  Sparkles,
  Calendar,
  Scissors,
  Eye,
} from 'lucide-react';
import SalonCard from './SalonCard';
import MarketplaceSection from './MarketplaceSection';
import AITryOn from './AITryOn';
import { Salon } from '../../lib/types';

const HERO_SLIDES = [
  {
    src: '/assets/img/hero-1.jpg',
    alt: 'Woman with beautiful knotless braids',
  },
  {
    src: '/assets/img/hero-2.jpg',
    alt: 'Woman with box braids in a salon',
  },
  {
    src: '/assets/img/hero-3.jpg',
    alt: 'Woman with long goddess braids',
  },
  {
    src: '/assets/img/hero-4.jpg',
    alt: 'Woman smiling with fresh braids',
  },
];

const SLIDE_INTERVAL_MS = 5000;

export default function HomeContent() {
  const router = useRouter();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAITryOn, setShowAITryOn] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHoveringHero, setIsHoveringHero] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    if (isHoveringHero) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHoveringHero]);

  const handleSearchSubmit = () => {
    const q = searchTerm.trim();
    router.push(q ? `/salons?q=${encodeURIComponent(q)}` : '/salons');
  };

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
            background: '#2a221f',
            color: '#fff',
            borderRadius: '12px',
            padding: '14px 16px',
            fontSize: '14px',
            fontFamily: 'Sora, system-ui, sans-serif',
          },
          success: { iconTheme: { primary: '#d4914c', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      {/* ─────────── HERO ─────────── */}
      <section
        className="relative overflow-hidden bg-espresso-950 min-h-[700px] flex items-center"
        onMouseEnter={() => setIsHoveringHero(true)}
        onMouseLeave={() => setIsHoveringHero(false)}
      >
        <div className="absolute inset-0 bg-espresso-950 -z-10" />

        {/* Slides with ken-burns on the active one */}
        <div className="absolute inset-0 z-0">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.src}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div
                className={`relative w-full h-full ${
                  index === activeSlide ? 'hero-kenburns' : ''
                }`}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="100vw"
                  unoptimized
                />
              </div>
            </div>
          ))}

          {/* Vertical overlay — lighter top, darker bottom for CTA readability */}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-espresso-950/55 via-espresso-950/50 to-espresso-950/90" />
          {/* Side vignette — moody edges, photo visible in the centre */}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-espresso-950/50 via-transparent to-espresso-950/50" />
        </div>

        {/* Content */}
        <div className="relative z-20 container-custom py-24 sm:py-32 w-full text-center">
          <div className="relative max-w-4xl mx-auto">
            {/* Radial scrim behind text only */}
            <div
              aria-hidden
              className="absolute inset-0 -z-10 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(26,20,16,0.65) 0%, rgba(26,20,16,0.25) 45%, rgba(26,20,16,0) 75%)',
                filter: 'blur(10px)',
                transform: 'scale(1.25)',
              }}
            />

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold text-white leading-[0.95] tracking-tight [text-shadow:0_2px_24px_rgba(0,0,0,0.45)]">
              Try the style on
              <br />
              <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-primary-200 bg-clip-text text-transparent">
                before you book.
              </span>
            </h1>

            <p className="mt-7 sm:mt-8 text-base sm:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
              Preview a braid style on your photo, then book a trusted salon to
              bring it to life.
            </p>

            <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowAITryOn(true)}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-400 to-primary-500 text-espresso-950 font-bold text-base rounded-2xl shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
              >
                <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Try on a style
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('salon-search');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold text-base rounded-2xl hover:bg-white/20 hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
              >
                <Search className="w-5 h-5" />
                Find a salon
              </button>
            </div>

            {/* Single-line trust row with real salon count */}
            <p className="mt-8 text-xs sm:text-sm text-white/60 [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
              Free to preview ·{' '}
              <span className="text-white/80 font-medium">
                {loading
                  ? '200+ verified UK salons'
                  : `${filteredSalons.length} verified UK ${
                      filteredSalons.length === 1 ? 'salon' : 'salons'
                    }`}
              </span>{' '}
              · no account needed
            </p>

            {/* Slide indicator bars */}
            <div className="mt-10 flex items-center justify-center gap-2">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === activeSlide}
                  className="relative h-1 w-12 rounded-full overflow-hidden bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <span
                    className={`absolute inset-0 origin-left bg-primary-500 ${
                      i === activeSlide ? 'scale-x-100' : 'scale-x-0'
                    }`}
                    style={{
                      transition:
                        i === activeSlide
                          ? `transform ${SLIDE_INTERVAL_MS}ms linear`
                          : 'transform 200ms ease-out',
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── HOW IT WORKS ─────────── */}
      <section className="bg-white border-b border-espresso-100">
        <div className="container-custom py-16 sm:py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-[0.15em] text-primary-600 uppercase mb-2">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-espresso-950">
              From inspiration to appointment
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-espresso-50 border border-espresso-100 flex items-center justify-center group-hover:bg-primary-50 group-hover:border-primary-200 transition-colors">
                <Scissors className="w-7 h-7 text-primary-600" />
              </div>
              <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">
                Step 1
              </p>
              <h3 className="text-xl font-display font-bold text-espresso-950 mb-2">
                Preview the style
              </h3>
              <p className="text-sm text-espresso-500 leading-relaxed max-w-xs mx-auto">
                See any braid style on your photo in seconds.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-espresso-50 border border-espresso-100 flex items-center justify-center group-hover:bg-primary-50 group-hover:border-primary-200 transition-colors">
                <Search className="w-7 h-7 text-primary-600" />
              </div>
              <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">
                Step 2
              </p>
              <h3 className="text-xl font-display font-bold text-espresso-950 mb-2">
                Find your salon
              </h3>
              <p className="text-sm text-espresso-500 leading-relaxed max-w-xs mx-auto">
                Browse verified UK braiders and stylists in your area.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-espresso-50 border border-espresso-100 flex items-center justify-center group-hover:bg-primary-50 group-hover:border-primary-200 transition-colors">
                <Calendar className="w-7 h-7 text-primary-600" />
              </div>
              <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">
                Step 3
              </p>
              <h3 className="text-xl font-display font-bold text-espresso-950 mb-2">
                Book with confidence
              </h3>
              <p className="text-sm text-espresso-500 leading-relaxed max-w-xs mx-auto">
                Book your appointment knowing exactly how the style will look.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── SALON SEARCH ─────────── */}
      <section id="salon-search" className="container-custom py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-xs font-semibold tracking-[0.15em] text-primary-600 uppercase mb-2">
            Ready to book?
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-espresso-950">
            Find a salon near you
          </h2>
          <p className="text-base text-espresso-500 mt-3 max-w-xl mx-auto">
            Search trusted braiding and beauty salons across the UK by name,
            town, or postcode.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-espresso-400 group-focus-within:text-primary-500 transition-colors pointer-events-none z-10" />

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
              className="w-full pl-14 pr-32 py-4 sm:py-5 bg-white border border-espresso-200 rounded-2xl text-espresso-950 placeholder-espresso-400 shadow-[0_8px_30px_-12px_rgba(42,34,31,0.12)] focus:border-primary-400 focus:ring-4 focus:ring-primary-500/15 transition-all outline-none text-base"
            />

            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-[105px] top-1/2 -translate-y-1/2 p-1.5 hover:bg-espresso-100 rounded-full transition-colors z-10"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-espresso-500" />
              </button>
            )}

            <button
              onClick={handleSearchSubmit}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-3 bg-primary-500 text-espresso-950 text-sm font-semibold rounded-xl hover:bg-primary-400 transition-colors shadow-sm z-10"
            >
              Search
            </button>
          </div>
        </div>

        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-primary-600 uppercase mb-2">
              {searchTerm ? 'Results' : 'Featured'}
            </p>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-espresso-950">
              {searchTerm ? 'Matching salons' : 'Trusted salons'}
            </h3>
            <p className="text-sm text-espresso-500 mt-1.5">
              {loading
                ? 'Loading salons…'
                : `${filteredSalons.length} ${
                    filteredSalons.length === 1 ? 'salon' : 'salons'
                  }${searchTerm ? ` for "${searchTerm}"` : ' available'}`}
            </p>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-primary-700 hover:text-primary-800 font-medium transition-colors flex-shrink-0"
            >
              Clear search
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-espresso-100 animate-pulse aspect-[4/5]"
              />
            ))}
          </div>
        ) : filteredSalons.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-espresso-100">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center">
              <Search className="w-7 h-7 text-primary-400" />
            </div>
            <h3 className="text-xl font-display font-semibold text-espresso-950">
              {searchTerm ? 'No salons found' : 'No salons yet'}
            </h3>
            <p className="text-espresso-500 mt-2 max-w-sm mx-auto text-sm">
              {searchTerm
                ? 'Try a different name, town, or postcode.'
                : 'Check back soon — new salons are joining every week.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSalons.slice(0, 6).map((salon) => (
                <SalonCard key={salon.id} salon={salon} />
              ))}
            </div>

            {filteredSalons.length > 6 && (
              <div className="text-center mt-10">
                <button
                  onClick={() => router.push('/salons')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-espresso-950 text-white font-semibold rounded-xl hover:bg-espresso-800 transition-all"
                >
                  View all {filteredSalons.length} salons
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <MarketplaceSection />

      {/* ─────────── TRY-ON MODAL ─────────── */}
      {showAITryOn && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-0 sm:p-6 bg-espresso-950/70 backdrop-blur-md overflow-y-auto animate-fadeIn"
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
          from {
            transform: translateY(24px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes heroKenBurns {
          from {
            transform: scale(1.04);
          }
          to {
            transform: scale(1.12);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        :global(.hero-kenburns) {
          animation: heroKenBurns 12s ease-out forwards;
        }
      `}</style>
    </>
  );
}