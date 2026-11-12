// app/bookings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface BookingSummary {
  id: number;
  status: string;
  serviceName: string;
  salonName: string;
  salonCity?: string | null;
  date: string;
  time: string;
  amount: number;
  paymentStatus?: string | null;
  currency?: string;
}

export default function BookingsListPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    if (!token) {
      router.replace('/login?redirect=/bookings');
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch('/api/auth/bookings', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });

        if (res.status === 401 || res.status === 403) {
          router.replace('/login?redirect=/bookings');
          return;
        }
        if (!res.ok) {
          if (!cancelled) {
            setError('Could not load your bookings. Please try again.');
            setLoading(false);
          }
          return;
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : data.content ?? [];
        if (!cancelled) {
          setBookings(list);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError('Network error. Please try again.');
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-espresso-50 py-12 px-4">
        <div className="container-custom max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-espresso-500 hover:text-espresso-950 font-medium transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Header */}
          <div className="mb-10">
            <p className="text-xs font-semibold tracking-[0.15em] text-primary-600 uppercase mb-2">
              Your appointments
            </p>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-espresso-950">
              My Bookings
            </h1>
            <p className="text-espresso-500 mt-2 text-sm">
              View and manage your upcoming and past appointments.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-3xl border border-espresso-100 p-16 text-center">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary-500" />
              <p className="mt-4 text-espresso-500 text-sm">Loading bookings…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-white rounded-3xl border border-espresso-100 p-12 text-center">
              <AlertCircle className="w-10 h-10 mx-auto text-red-500" />
              <p className="mt-4 text-espresso-950 font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-5 py-2.5 bg-espresso-950 text-white text-sm font-semibold rounded-xl hover:bg-primary-500 hover:text-espresso-950 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && bookings.length === 0 && (
            <div className="bg-white rounded-3xl border border-espresso-100 p-12 sm:p-16 text-center shadow-[0_20px_60px_-15px_rgba(42,34,31,0.1)]">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-espresso-50 border border-espresso-100 flex items-center justify-center">
                <Calendar className="w-9 h-9 text-espresso-300" />
              </div>
              <h2 className="mt-6 text-2xl font-display font-bold text-espresso-950">
                No bookings yet
              </h2>
              <p className="text-espresso-500 text-sm mt-3 max-w-sm mx-auto leading-relaxed">
                When you book a service, it&apos;ll show up here so you can
                review it anytime.
              </p>
              <Link
                href="/salons"
                className="mt-8 inline-block px-6 py-3 bg-espresso-950 text-white text-sm font-semibold rounded-xl hover:bg-primary-500 hover:text-espresso-950 transition-all shadow-lg shadow-espresso-950/10"
              >
                Browse salons
              </Link>
            </div>
          )}

          {/* List */}
          {!loading && !error && bookings.length > 0 && (
            <ul className="space-y-4">
              {bookings.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/bookings/${b.id}`}
                    className="group flex items-stretch gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-espresso-100 hover:border-primary-300 hover:shadow-[0_20px_40px_-20px_rgba(42,34,31,0.15)] hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {/* Date block */}
                    <div className="w-16 sm:w-20 shrink-0 rounded-xl bg-espresso-950 flex flex-col items-center justify-center py-3 text-white shadow-md">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-primary-400">
                        {formatMonth(b.date)}
                      </span>
                      <span className="text-2xl sm:text-3xl font-display font-bold leading-none mt-1">
                        {formatDay(b.date)}
                      </span>
                      <span className="text-[10px] text-espresso-300 font-medium mt-1">
                        {formatWeekday(b.date)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display font-bold text-espresso-950 truncate text-lg">
                          {b.serviceName}
                        </h3>
                        <StatusBadge status={b.status} />
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-espresso-500">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-espresso-400" />
                          <span className="font-medium text-espresso-700">{b.salonName}</span>
                          {b.salonCity && (
                            <span className="text-espresso-400">· {b.salonCity}</span>
                          )}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-espresso-400" />
                          {b.time}
                        </span>
                      </div>

                      {b.amount != null && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-base font-display font-bold text-espresso-950">
                            {b.currency ?? 'GBP'}{' '}
                            {Number(b.amount).toFixed(2)}
                          </span>
                          {b.paymentStatus && (
                            <PaymentBadge status={b.paymentStatus} />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center shrink-0">
                      <ChevronRight className="w-5 h-5 text-espresso-300 group-hover:text-primary-500 transition-colors group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ─────────────── Helpers ─────────────── */

function formatMonth(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleString('en-GB', { month: 'short' });
  } catch {
    return '';
  }
}

function formatDay(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return String(d.getDate());
  } catch {
    return '—';
  }
}

function formatWeekday(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleString('en-GB', { weekday: 'short' });
  } catch {
    return '';
  }
}

function StatusBadge({ status }: { status: string }) {
  const s = (status ?? '').toUpperCase();
  const map: Record<string, string> = {
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
  };
  const cls = map[s] ?? 'bg-espresso-50 text-espresso-600 border-espresso-200';
  return (
    <span
      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize shrink-0 ${cls}`}
    >
      {(status ?? '').toLowerCase()}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const map: Record<string, { cls: string; label: string }> = {
    SUCCESS: { cls: 'bg-emerald-100 text-emerald-700', label: 'Paid' },
    PENDING: { cls: 'bg-amber-100 text-amber-700', label: 'Unpaid' },
    PROCESSING: { cls: 'bg-amber-100 text-amber-700', label: 'Processing' },
    FAILED: { cls: 'bg-red-100 text-red-700', label: 'Failed' },
    REFUNDED: { cls: 'bg-blue-100 text-blue-700', label: 'Refunded' },
  };
  const style = map[s] ?? {
    cls: 'bg-espresso-100 text-espresso-600',
    label: status,
  };
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${style.cls}`}
    >
      {style.label}
    </span>
  );
}