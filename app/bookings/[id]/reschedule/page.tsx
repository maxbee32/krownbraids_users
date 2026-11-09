'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Lock,
} from 'lucide-react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import toast from 'react-hot-toast';

interface BookingDetails {
  id: number;
  status: string;
  serviceName: string;
  salonName: string;
  date: string;
  time: string;
  duration?: number | null;
}

function buildDateOptions(daysAhead = 30) {
  const options: { value: string; label: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    // Local date string — avoids the UTC shift from toISOString()
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const iso = `${yyyy}-${mm}-${dd}`;

    const label = d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    let prefix = '';
    if (i === 0) prefix = 'Today · ';
    else if (i === 1) prefix = 'Tomorrow · ';
    options.push({ value: iso, label: `${prefix}${label}` });
  }
  return options;
}

function buildTimeOptions() {
  const options: { value: string; label: string }[] = [];
  for (let hour = 9; hour <= 18; hour++) {
    for (const minute of [0, 30]) {
      if (hour === 18 && minute === 30) continue;
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      const suffix = hour < 12 ? 'AM' : 'PM';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      options.push({
        value: `${h}:${m}`,
        label: `${displayHour}:${m} ${suffix}`,
      });
    }
  }
  return options;
}

export default function ReschedulePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const bookingId = params?.id;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const dateOptions = useMemo(() => buildDateOptions(30), []);
  const timeOptions = useMemo(() => buildTimeOptions(), []);

  useEffect(() => {
    if (!bookingId) return;

    const token =
      typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    if (!token) {
      router.replace(`/login?redirect=/bookings/${bookingId}/reschedule`);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/auth/booking-details/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });

        if (res.status === 401 || res.status === 403) {
          router.replace(`/login?redirect=/bookings/${bookingId}/reschedule`);
          return;
        }
        if (res.status === 404) {
          if (!cancelled) {
            setError("We couldn't find that booking.");
            setLoading(false);
          }
          return;
        }
        if (!res.ok) {
          if (!cancelled) {
            setError('Could not load booking. Please try again.');
            setLoading(false);
          }
          return;
        }

        const data = await res.json();
        if (!cancelled) {
          setBooking(data);
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
  }, [bookingId, router]);

  const hoursUntilAppointment = (() => {
    if (!booking) return Infinity;
    const appointment = new Date(`${booking.date}T${booking.time}:00`);
    return (appointment.getTime() - Date.now()) / (1000 * 60 * 60);
  })();

  const isWithinWindow = hoursUntilAppointment > 48;
  const isCancelled = booking?.status?.toUpperCase() === 'CANCELLED';

  const handleSubmit = async () => {
    console.log('[reschedule] submit', { newDate, newTime, submitting });
    if (!booking || submitting) return;

    if (!newDate || !newTime) {
      toast.error('Please choose a new date and time');
      return;
    }

    if (newDate === booking.date && newTime === booking.time) {
      toast.error('Please choose a different date or time');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(
        `/api/auth/bookings/${booking.id}/reschedule`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appointmentDate: newDate,
            appointmentTime: newTime,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success('Booking rescheduled');
        router.push(`/bookings/${booking.id}`);
      } else if (res.status === 409) {
        toast.error(
          data.error ??
            'That slot is not available or the booking can no longer be changed.'
        );
      } else if (res.status === 403) {
        toast.error('You cannot change this booking.');
      } else {
        toast.error(
          data.error ?? 'Could not reschedule. Please try again.'
        );
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream-50 py-10 px-4">
        <div className="container-custom max-w-lg mx-auto">
          <Link
            href={`/bookings/${bookingId}`}
            className="inline-flex items-center gap-1.5 text-sm text-plum-700 hover:text-plum-800 font-medium transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to booking
          </Link>

          {loading && (
            <div className="bg-white rounded-3xl border border-cream-200 p-12 text-center">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-plum-700" />
              <p className="mt-3 text-ink-500 text-sm">Loading booking…</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-white rounded-3xl border border-cream-200 p-12 text-center">
              <AlertCircle className="w-10 h-10 mx-auto text-red-500" />
              <h1 className="mt-4 text-xl font-display font-bold text-ink-900">
                {error}
              </h1>
              <Link
                href="/bookings"
                className="mt-6 inline-block px-5 py-2.5 bg-plum-700 text-white text-sm font-semibold rounded-xl hover:bg-plum-800"
              >
                Back to my bookings
              </Link>
            </div>
          )}

          {!loading && booking && (isCancelled || !isWithinWindow) && (
            <div className="bg-white rounded-3xl border border-cream-200 p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Lock className="w-7 h-7 text-amber-600" />
              </div>
              <h1 className="mt-5 text-xl font-display font-bold text-ink-900">
                {isCancelled
                  ? 'This booking was cancelled'
                  : 'Changes are locked'}
              </h1>
              <p className="mt-2 text-ink-500 text-sm max-w-sm mx-auto leading-relaxed">
                {isCancelled
                  ? 'You cannot reschedule a cancelled booking.'
                  : 'Bookings can only be rescheduled at least 48 hours before the appointment.'}
              </p>
              <Link
                href={`/bookings/${booking.id}`}
                className="mt-6 inline-block px-5 py-2.5 bg-plum-700 text-white text-sm font-semibold rounded-xl hover:bg-plum-800"
              >
                Back to booking
              </Link>
            </div>
          )}

          {!loading && booking && !isCancelled && isWithinWindow && (
            <div className="bg-white rounded-3xl border border-cream-200 shadow-[0_12px_40px_-20px_rgba(122,38,65,0.15)] overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-cream-200">
                <p className="text-xs uppercase tracking-wider text-ink-400">
                  Booking #{booking.id}
                </p>
                <h1 className="mt-1 text-2xl font-display font-bold text-ink-900">
                  Reschedule appointment
                </h1>
                <p className="text-sm text-ink-500 mt-1">
                  {booking.serviceName} at {booking.salonName}
                </p>
              </div>

              {/* Current appointment */}
              <div className="px-6 sm:px-8 pt-6">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-cream-100 border border-cream-200">
                  <Calendar className="w-4 h-4 text-ink-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-xs uppercase tracking-wider text-ink-400 mb-1">
                      Current time
                    </p>
                    <p className="font-medium text-ink-900">
                      {formatDate(booking.date)} · {booking.time}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-5">
                <div>
                  <label
                    htmlFor="newDate"
                    className="block text-sm font-medium text-ink-900 mb-1.5"
                  >
                    New date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                    <select
                      id="newDate"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      disabled={submitting}
                      className="w-full pl-11 pr-10 py-3 bg-white border border-cream-200 rounded-xl text-ink-900 focus:border-plum-300 focus:ring-4 focus:ring-plum-100 transition-all outline-none text-sm appearance-none cursor-pointer"
                    >
                      <option value="">Select a date…</option>
                      {dateOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="newTime"
                    className="block text-sm font-medium text-ink-900 mb-1.5"
                  >
                    New time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                    <select
                      id="newTime"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      disabled={submitting}
                      className="w-full pl-11 pr-10 py-3 bg-white border border-cream-200 rounded-xl text-ink-900 focus:border-plum-300 focus:ring-4 focus:ring-plum-100 transition-all outline-none text-sm appearance-none cursor-pointer"
                    >
                      <option value="">Select a time…</option>
                      {timeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="flex-1 py-3 text-sm font-semibold text-ink-700 border border-cream-300 rounded-xl hover:bg-cream-50 transition-colors text-center"
                  >
                    Cancel
                  </Link>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 py-3 text-sm font-semibold text-white bg-plum-700 rounded-xl hover:bg-plum-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Rescheduling…
                      </>
                    ) : (
                      'Confirm new time'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}