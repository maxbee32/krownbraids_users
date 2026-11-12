// app/salons/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SalonCard from '../components/SalonCard';
import SearchBar from '../components/SearchBar';
import { Salon } from '../../lib/types';
import { Filter } from 'lucide-react'; // Added icon for filters

const QUICK_FILTERS = [
  'Box braids',
  'Knotless',
  'Cornrows',
  'Twists',
  'Dreads',
];

export default function SalonsPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/salons', {
          cache: 'no-store',
        });

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

  // Filter salons based on the search term
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

  const isFilterActive = (cat: string) => searchTerm.toLowerCase() === cat.toLowerCase();

  return (
    <>
      <Header />

      <main className="relative min-h-screen bg-espresso-50 pb-24">
        {/* ─── Page Header ─── */}
        <section className="bg-espresso-950 pt-16 pb-32 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.08]">
            <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-primary-500 rounded-full blur-3xl" />
            <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-espresso-600 rounded-full blur-3xl" />
          </div>

          <div className="relative container-custom text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-white tracking-tight">
              Find your next{' '}
              <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-primary-200 bg-clip-text text-transparent">
                stylist.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-espresso-100/70 max-w-xl mx-auto leading-relaxed">
              Browse trusted braiding and beauty salons across the UK. 
              Filter by name, town, or postcode to find your perfect match.
            </p>
          </div>
        </section>

        {/* ─── Search Bar & Quick Filters ─── */}
        <div className="relative -mt-8 z-10 container-custom">
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(42,34,31,0.15)] border border-espresso-100 max-w-4xl mx-auto overflow-hidden">
            <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
            
            {/* Quick Filters added below search bar */}
            <div className="px-8 pb-6 border-t border-espresso-100 pt-4 flex items-center gap-3 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-espresso-500 uppercase tracking-wider shrink-0 mr-2">
                <Filter className="w-3.5 h-3.5" />
                Quick filters
              </div>
              
              {QUICK_FILTERS.map((cat) => {
                const active = isFilterActive(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setSearchTerm(active ? '' : cat)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all border whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-primary-500 text-espresso-950 border-primary-500 shadow-sm'
                        : 'bg-espresso-50 text-espresso-700 border-espresso-200 hover:bg-espresso-100'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Salon Grid ─── */}
        <section className="container-custom pt-12 sm:pt-16">
          {/* Results Header */}
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-espresso-950">
                {searchTerm ? 'Search results' : 'All salons'}
              </h2>
              <p className="text-sm text-espresso-500 mt-1.5">
                {loading
                  ? 'Loading salons…'
                  : `${filteredSalons.length} ${
                      filteredSalons.length === 1 ? 'salon' : 'salons'
                    }${searchTerm ? ` matching "${searchTerm}"` : ' available'}`}
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

          {/* States: Loading, Empty, or Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-espresso-100/50 animate-pulse aspect-[4/5]"
                />
              ))}
            </div>
          ) : filteredSalons.length === 0 ? (
            <div className="text-center py-24 px-6 bg-white rounded-3xl border border-espresso-100 max-w-2xl mx-auto shadow-sm">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-espresso-50 flex items-center justify-center">
                <span className="text-4xl">🏠</span>
              </div>
              <h3 className="text-xl font-display font-bold text-espresso-950 mb-2">
                {searchTerm ? 'No salons found' : 'No salons available yet'}
              </h3>
              <p className="text-espresso-500 text-sm max-w-sm mx-auto mb-6">
                {searchTerm
                  ? `We couldn't find any salons matching "${searchTerm}". Try a different name, town, or postcode.`
                  : 'Check back soon — new salons are joining every week.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-espresso-950 text-white rounded-xl font-semibold text-sm hover:bg-espresso-800 transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredSalons.map((salon) => (
                <SalonCard key={salon.id} salon={salon} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}