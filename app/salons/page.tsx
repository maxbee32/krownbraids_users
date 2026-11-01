'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SalonCard from '../components/SalonCard';
import { Salon } from '../../lib/types';

export default function SalonsPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <>
        <Header />
        <main className="relative min-h-screen bg-cream-50 py-12 px-4 overflow-hidden">
          <div className="container-custom text-center py-24 relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-plum-200 border-t-plum-700 mx-auto" />
            <p className="text-ink-500 mt-4 text-sm">Loading salons…</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="relative min-h-screen bg-cream-50 py-12 px-4 overflow-hidden">
        {/* Soft rose bloom behind the grid */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] opacity-[0.22]">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-brand-200 via-plum-100 to-transparent blur-3xl" />
          </div>
          <div
            className="absolute inset-0 opacity-[0.25] mix-blend-soft-light"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, #7a2641 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="relative container-custom">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-[0.15em] text-rose-brand-600 uppercase mb-2">
              Discover
            </p>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink-900">
              Browse salons
            </h1>
            <p className="text-ink-500 mt-2 max-w-xl mx-auto">
              {salons.length > 0
                ? `${salons.length} ${salons.length === 1 ? 'salon' : 'salons'} ready to book`
                : 'Discover braiding salons and book your next appointment.'}
            </p>
          </div>

          {salons.length === 0 ? (
            <div className="text-center py-24 px-4">
              <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-plum-50 border border-plum-100 flex items-center justify-center">
                <span className="text-3xl">🏠</span>
              </div>
              <h2 className="text-xl font-display font-semibold text-ink-900">
                No salons yet
              </h2>
              <p className="text-ink-500 mt-2 text-sm max-w-sm mx-auto">
                Check back soon — new salons are joining every week.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {salons.map((salon) => (
                <SalonCard key={salon.id} salon={salon} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}