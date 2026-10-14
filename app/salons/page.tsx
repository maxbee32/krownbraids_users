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
        <main className="min-h-screen bg-cream-50 py-12 px-4">
          <div className="container-custom text-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 mx-auto" />
            <p className="text-gray-500 mt-4 text-sm">Loading salons…</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-cream-50 py-12 px-4">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900">
              Browse salons
            </h1>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">
              {salons.length > 0
                ? `${salons.length} ${salons.length === 1 ? 'salon' : 'salons'} ready to book`
                : 'Discover braiding salons and book your next appointment.'}
            </p>
          </div>

          {salons.length === 0 ? (
            <div className="text-center py-24 px-4">
              <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-cream-100 border border-cream-200 flex items-center justify-center">
                <span className="text-3xl">🏠</span>
              </div>
              <h2 className="text-xl font-display font-semibold text-gray-800">
                No salons yet
              </h2>
              <p className="text-gray-500 mt-2 text-sm max-w-sm mx-auto">
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