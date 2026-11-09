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
      <main className="min-h-screen bg-cream-50 py-10 px-4">
        <div className="container-custom max-w-3xl mx-auto">
          {/* Back link — same style as the details page */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-plum-700 hover:text-plum-800 font-medium transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-[0.15em] text-rose-brand-600 uppercase mb-2">
              Your appointments
            </p>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink-900">
              My bookings
            </h1>
            <p className="text-ink-500 mt-2 text-sm">
              View and manage your upcoming and past appointments.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-3xl border border-cream-200 p-12 text-center">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-plum-700" />
              <p className="mt-3 text-ink-500 text-sm">Loading bookings…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-white rounded-3xl border border-cream-200 p-12 text-center">
              <AlertCircle className="w-10 h-10 mx-auto text-red-500" />
              <p className="mt-4 text-ink-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-5 py-2.5 bg-plum-700 text-white text-sm font-semibold rounded-xl hover:bg-plum-800 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && bookings.length === 0 && (
            <div className="bg-white rounded-3xl border border-cream-200 p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-plum-50 border border-plum-100 flex items-center justify-center">
                <Calendar className="w-7 h-7 text-plum-600" />
              </div>
              <h2 className="mt-5 text-xl font-display font-bold text-ink-900">
                No bookings yet
              </h2>
              <p className="text-ink-500 text-sm mt-2 max-w-sm mx-auto">
                When you book a service, it&apos;ll show up here so you can
                review it anytime.
              </p>
              <Link
                href="/salons"
                className="mt-6 inline-block px-5 py-2.5 bg-plum-700 text-white text-sm font-semibold rounded-xl hover:bg-plum-800 transition-colors"
              >
                Browse salons
              </Link>
            </div>
          )}

          {/* List */}
          {!loading && !error && bookings.length > 0 && (
            <ul className="space-y-3">
              {bookings.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/bookings/${b.id}`}
                    className="group flex items-stretch gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-cream-200 hover:border-plum-200 hover:shadow-[0_8px_24px_-16px_rgba(122,38,65,0.2)] transition-all"
                  >
                    {/* Date block */}
                    <div className="w-16 sm:w-18 shrink-0 rounded-xl bg-plum-50 border border-plum-100 flex flex-col items-center justify-center py-2 text-plum-700">
                      <span className="text-[10px] uppercase tracking-wider font-semibold">
                        {formatMonth(b.date)}
                      </span>
                      <span className="text-2xl font-display font-bold leading-none">
                        {formatDay(b.date)}
                      </span>
                      <span className="text-[10px] text-plum-500 font-medium mt-0.5">
                        {formatWeekday(b.date)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display font-bold text-ink-900 truncate">
                          {b.serviceName}
                        </h3>
                        <StatusBadge status={b.status} />
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {b.salonName}
                          {b.salonCity && (
                            <span className="text-ink-400">· {b.salonCity}</span>
                          )}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {b.time}
                        </span>
                      </div>

                      {b.amount != null && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm font-display font-bold text-plum-700">
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
                      <ChevronRight className="w-5 h-5 text-ink-300 group-hover:text-plum-700 transition-colors" />
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
  const cls = map[s] ?? 'bg-cream-100 text-ink-600 border-cream-200';
  return (
    <span
      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize shrink-0 ${cls}`}
    >
      {(status ?? '').toLowerCase()}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const map: Record<string, { cls: string; label: string }> = {
    SUCCESS: { cls: 'bg-emerald-50 text-emerald-700', label: 'Paid' },
    PENDING: { cls: 'bg-amber-50 text-amber-700', label: 'Unpaid' },
    PROCESSING: { cls: 'bg-amber-50 text-amber-700', label: 'Processing' },
    FAILED: { cls: 'bg-red-50 text-red-700', label: 'Failed' },
    REFUNDED: { cls: 'bg-blue-50 text-blue-700', label: 'Refunded' },
  };
  const style = map[s] ?? {
    cls: 'bg-cream-100 text-ink-600',
    label: status,
  };
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${style.cls}`}
    >
      {style.label}
    </span>
  );
}