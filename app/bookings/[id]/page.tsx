'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  FileText,
  ImagePlus,
  Trash2,
  Pencil,
  Lock,
  Star,
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { resolveBookingImageUrl } from '@/lib/imageUrl';
import toast from 'react-hot-toast';

interface BookingDetails {
  id: number;
  status: string;
  serviceName: string;
  salonId: number;
  salonName: string;
  salonAddress?: string | null;
  salonPhone?: string | null;
  salonImageUrl?: string | null;
  date: string;
  time: string;
  duration?: number | null;
  amount: number;
  currency?: string;
  paymentStatus?: string | null;
  paymentReference?: string | null;
  amountPaid?: number | null;
  customerName?: string;
  customerEmail?: string;
  staffName?: string | null;
  notes?: string | null;
  referenceImages?: string[] | null;
}

export default function BookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const bookingId = params?.id;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (!bookingId) return;

    const token =
      typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    if (!token) {
      router.replace(`/login?redirect=/bookings/${bookingId}`);
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
          router.replace(`/login?redirect=/bookings/${bookingId}`);
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

  const isPending = booking?.status?.toUpperCase() === 'PENDING';
  const isConfirmed = booking?.status?.toUpperCase() === 'CONFIRMED';
  const isCancelled = booking?.status?.toUpperCase() === 'CANCELLED';
  const isCompleted = booking?.status?.toUpperCase() === 'COMPLETED';
  const isPaid = booking?.paymentStatus?.toUpperCase() === 'SUCCESS';

  // 48-hour rule: editable only if the appointment is >48h away
  const hoursUntilAppointment = (() => {
    if (!booking) return Infinity;
    const appointment = new Date(`${booking.date}T${booking.time}:00`);
    return (appointment.getTime() - Date.now()) / (1000 * 60 * 60);
  })();

  const isWithinWindow = hoursUntilAppointment > 48;
  const canManage = !isCancelled && isWithinWindow && (isPending || isConfirmed);

  const handleCancel = async () => {
    if (!booking) return;
    setCancelling(true);

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/auth/bookings/${booking.id}/cancel`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'Cancelled by customer' }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success('Booking cancelled');
        setBooking({ ...booking, status: 'CANCELLED' });
        setShowCancelConfirm(false);
      } else if (res.status === 409) {
        toast.error(
          data.error ?? 'This booking can no longer be cancelled.'
        );
      } else if (res.status === 403) {
        toast.error('You cannot cancel this booking.');
      } else {
        toast.error('Could not cancel booking. Please try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream-50 py-10 px-4">
        <div className="container-custom max-w-2xl mx-auto">
          <Link
            href="/bookings"
            className="inline-flex items-center gap-1.5 text-sm text-plum-700 hover:text-plum-800 font-medium transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            All bookings
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
                className="mt-6 inline-block px-5 py-2.5 bg-plum-700 text-white text-sm font-semibold rounded-xl hover:bg-plum-800 transition-colors"
              >
                Back to my bookings
              </Link>
            </div>
          )}

          {!loading && booking && (
            <div className="bg-white rounded-3xl border border-cream-200 shadow-[0_12px_40px_-20px_rgba(122,38,65,0.15)] overflow-hidden">
              {/* Header */}
              <div className="p-6 sm:p-8 border-b border-cream-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-ink-400">
                      Booking #{booking.id}
                    </p>
                    <h1 className="mt-1 text-2xl font-display font-bold text-ink-900 truncate">
                      {booking.serviceName}
                    </h1>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              </div>

              {/* Completed — leave a review */}
              {isCompleted && (
  <div className="px-6 sm:px-8 pt-6">
    <Link
      href={`/bookings/${booking.id}/review`}
      className="group block p-5 rounded-2xl bg-gradient-to-br from-plum-50 via-cream-50 to-rose-brand-50 border border-plum-100 hover:border-plum-300 hover:shadow-[0_8px_24px_-16px_rgba(122,38,65,0.25)] transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-white border border-plum-200 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Star className="w-6 h-6 text-plum-700 fill-plum-200" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display font-bold text-ink-900">
              How was your visit?
            </p>
            <ArrowLeft className="w-4 h-4 text-plum-700 rotate-180 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </div>
          <p className="text-sm text-ink-500 mt-1 leading-relaxed">
            Share your experience at{' '}
            <span className="font-medium text-ink-700">{booking.salonName}</span>.
            It only takes a minute.
          </p>

          {/* Star preview */}
          <div className="flex items-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className="w-4 h-4 text-plum-200 fill-plum-100 group-hover:text-plum-400 group-hover:fill-plum-300 transition-colors"
              />
            ))}
            <span className="ml-2 text-xs text-ink-400 font-medium">
              Tap to rate
            </span>
          </div>
        </div>
      </div>
    </Link>
  </div>
)}

              {/* Pending / paid status banner */}
              {isPending && !isCancelled && (
                <div className="px-6 sm:px-8 pt-6">
                  <div
                    className={`flex items-start gap-3 p-4 rounded-2xl border ${
                      isPaid
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-cream-100 border-cream-200'
                    }`}
                  >
                    {isPaid ? (
                      <>
                        <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold text-amber-800">
                            Waiting for salon confirmation
                          </p>
                          <p className="text-amber-700/80 mt-1 text-xs leading-relaxed">
                            Your payment went through. The salon will review
                            your booking shortly and confirm your appointment.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-ink-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold text-ink-700">
                            Payment pending
                          </p>
                          <p className="text-ink-500 mt-1 text-xs leading-relaxed">
                            Complete payment to send your booking to the salon
                            for review.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Cancelled banner */}
              {isCancelled && (
                <div className="px-6 sm:px-8 pt-6">
                  <div className="flex items-start gap-3 p-4 rounded-2xl border bg-red-50 border-red-200">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold text-red-800">
                        Booking cancelled
                      </p>
                      <p className="text-red-700/80 mt-1 text-xs leading-relaxed">
                        This booking was cancelled. If you were charged, a refund
                        will be processed automatically.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <DetailRow
                  icon={<MapPin className="w-4 h-4" />}
                  label="Salon"
                  value={
                    <>
                      <div className="font-medium text-ink-900">
                        {booking.salonName}
                      </div>
                      {booking.salonAddress && (
                        <div className="text-ink-500 text-sm mt-0.5">
                          {booking.salonAddress}
                        </div>
                      )}
                    </>
                  }
                />

                <DetailRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="When"
                  value={
                    <div className="font-medium text-ink-900 flex items-center gap-2 flex-wrap">
                      <span>{formatDate(booking.date)}</span>
                      <span className="text-ink-300">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-ink-400" />
                        {booking.time}
                      </span>
                      {booking.duration ? (
                        <span className="text-ink-500 text-sm">
                          ({booking.duration} min)
                        </span>
                      ) : null}
                    </div>
                  }
                />

                {booking.staffName && (
                  <DetailRow
                    icon={<User className="w-4 h-4" />}
                    label="Stylist"
                    value={
                      <div className="font-medium text-ink-900">
                        {booking.staffName}
                      </div>
                    }
                  />
                )}

                {booking.salonPhone && (
                  <DetailRow
                    icon={<Phone className="w-4 h-4" />}
                    label="Contact"
                    value={
                      <a
                        href={`tel:${booking.salonPhone}`}
                        className="font-medium text-plum-700 hover:text-plum-800 transition-colors"
                      >
                        {booking.salonPhone}
                      </a>
                    }
                  />
                )}

                <DetailRow
                  icon={<CreditCard className="w-4 h-4" />}
                  label="Payment"
                  value={
                    <div>
                      <div className="font-display font-bold text-plum-700 text-lg leading-none">
                        {booking.currency ?? 'GBP'}{' '}
                        {Number(
                          booking.amountPaid ?? booking.amount ?? 0
                        ).toFixed(2)}
                      </div>
                      <div className="mt-2">
                        <PaymentBadge status={booking.paymentStatus} />
                      </div>
                      {booking.paymentReference && (
                        <div className="text-[11px] text-ink-400 mt-2 break-all font-mono">
                          Ref: {booking.paymentReference}
                        </div>
                      )}
                    </div>
                  }
                />

                {booking.customerName && (
                  <DetailRow
                    icon={<User className="w-4 h-4" />}
                    label="Booked for"
                    value={
                      <div>
                        <div className="font-medium text-ink-900">
                          {booking.customerName}
                        </div>
                        {booking.customerEmail && (
                          <div className="text-ink-500 text-sm mt-0.5">
                            {booking.customerEmail}
                          </div>
                        )}
                      </div>
                    }
                  />
                )}

                {booking.notes && (
                  <DetailRow
                    icon={<FileText className="w-4 h-4" />}
                    label="Notes"
                    value={
                      <p className="text-ink-700 text-sm whitespace-pre-line leading-relaxed">
                        {booking.notes}
                      </p>
                    }
                  />
                )}

                {booking.referenceImages &&
                  booking.referenceImages.length > 0 && (
                    <DetailRow
                      icon={<ImagePlus className="w-4 h-4" />}
                      label="Reference photos"
                      value={
                        <div className="flex gap-2 flex-wrap mt-1">
                          {booking.referenceImages.map((filename, i) => {
                            const url = resolveBookingImageUrl(
                              booking.id,
                              filename
                            );
                            return (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block group"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={url}
                                  alt={`Reference ${i + 1}`}
                                  className="w-20 h-20 object-cover rounded-xl border border-cream-200 group-hover:border-plum-300 transition-colors"
                                />
                              </a>
                            );
                          })}
                        </div>
                      }
                    />
                  )}
              </div>

              {/* 48-hour lock notice */}
              {!isCancelled && !isWithinWindow && !isCompleted && (
                <div className="px-6 sm:px-8 pb-4">
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-ink-50 border border-cream-200 text-xs text-ink-600">
                    <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <p>
                      This booking can no longer be changed. Changes are only
                      available at least 48 hours before the appointment.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="px-6 sm:px-8 py-5 border-t border-cream-200 bg-cream-50 flex flex-wrap gap-3">
                <Link
                  href="/bookings"
                  className="px-4 py-2 text-sm font-semibold text-plum-700 border border-plum-200 rounded-xl hover:bg-white transition-colors"
                >
                  All bookings
                </Link>
                {booking.salonId && (
                  <Link
                    href={`/salons/${booking.salonId}`}
                    className="px-4 py-2 text-sm font-semibold text-ink-700 border border-cream-300 rounded-xl hover:bg-white transition-colors"
                  >
                    View salon
                  </Link>
                )}

                {canManage && (
                  <>
                    <Link
                      href={`/bookings/${booking.id}/reschedule`}
                      className="px-4 py-2 text-sm font-semibold text-plum-700 border border-plum-200 rounded-xl hover:bg-white transition-colors inline-flex items-center gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Reschedule
                    </Link>
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      disabled={cancelling}
                      className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Cancel booking
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Cancel confirmation modal */}
      {showCancelConfirm && booking && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !cancelling && setShowCancelConfirm(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="mt-4 text-xl font-display font-bold text-ink-900 text-center">
              Cancel this booking?
            </h2>
            <p className="mt-2 text-sm text-ink-500 text-center leading-relaxed">
              Your appointment on{' '}
              <span className="font-medium text-ink-700">
                {formatDate(booking.date)} at {booking.time}
              </span>{' '}
              will be cancelled.
              {isPaid && (
                <>
                  {' '}
                  A refund of{' '}
                  <span className="font-medium text-ink-700">
                    {booking.currency ?? 'GBP'}{' '}
                    {Number(
                      booking.amountPaid ?? booking.amount ?? 0
                    ).toFixed(2)}
                  </span>{' '}
                  will be processed to your original payment method.
                </>
              )}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
                className="flex-1 py-2.5 text-sm font-semibold text-ink-700 border border-cream-300 rounded-xl hover:bg-cream-50 transition-colors disabled:opacity-50"
              >
                Keep booking
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling…
                  </>
                ) : (
                  'Yes, cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────────── Helpers ─────────────── */

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

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-plum-50 border border-plum-100 flex items-center justify-center text-plum-700 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs uppercase tracking-wider text-ink-400 mb-1">
          {label}
        </div>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = (status ?? '').toUpperCase();
  const map: Record<
    string,
    { cls: string; icon: React.ReactNode; label: string }
  > = {
    CONFIRMED: {
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      label: 'Confirmed',
    },
    PENDING: {
      cls: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <Loader2 className="w-3.5 h-3.5" />,
      label: 'Pending',
    },
    COMPLETED: {
      cls: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      label: 'Completed',
    },
    CANCELLED: {
      cls: 'bg-red-50 text-red-700 border-red-200',
      icon: <XCircle className="w-3.5 h-3.5" />,
      label: 'Cancelled',
    },
    REJECTED: {
      cls: 'bg-red-50 text-red-700 border-red-200',
      icon: <XCircle className="w-3.5 h-3.5" />,
      label: 'Rejected',
    },
  };
  const style = map[s] ?? {
    cls: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: null,
    label: status || 'Unknown',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold shrink-0 ${style.cls}`}
    >
      {style.icon}
      {style.label}
    </span>
  );
}

function PaymentBadge({ status }: { status?: string | null }) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600 text-[11px] font-semibold">
        Payment not recorded
      </span>
    );
  }
  const s = status.toUpperCase();
  const map: Record<string, { cls: string; label: string }> = {
    SUCCESS: {
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'Paid',
    },
    PENDING: {
      cls: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'Payment pending',
    },
    PROCESSING: {
      cls: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'Processing',
    },
    FAILED: {
      cls: 'bg-red-50 text-red-700 border-red-200',
      label: 'Payment failed',
    },
    CANCELLED: {
      cls: 'bg-gray-50 text-gray-700 border-gray-200',
      label: 'Payment cancelled',
    },
    REFUNDED: {
      cls: 'bg-blue-50 text-blue-700 border-blue-200',
      label: 'Refunded',
    },
  };
  const style = map[s] ?? {
    cls: 'bg-gray-50 text-gray-700 border-gray-200',
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${style.cls}`}
    >
      {style.label}
    </span>
  );
}