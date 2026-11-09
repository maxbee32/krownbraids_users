'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, ArrowLeft, Star } from 'lucide-react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import toast from 'react-hot-toast';

interface BookingDetails {
  id: number;
  status: string;
  serviceName: string;
  salonName: string;
}

export default function ReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const bookingId = params?.id;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    if (!bookingId) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace(`/login?redirect=/bookings/${bookingId}/review`);
      return;
    }

    const load = async () => {
      try {
        const [bookingRes, reviewRes] = await Promise.all([
          fetch(`/api/auth/booking-details/${bookingId}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          }),
          fetch(`/api/auth/reviews/booking/${bookingId}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          }),
        ]);

        if (bookingRes.status === 401 || bookingRes.status === 403) {
          router.replace(`/login?redirect=/bookings/${bookingId}/review`);
          return;
        }
        if (bookingRes.status === 404) {
          setError("We couldn't find that booking.");
          setLoading(false);
          return;
        }
        if (!bookingRes.ok) {
          setError('Could not load booking. Please try again.');
          setLoading(false);
          return;
        }

        const data = await bookingRes.json();
        if (data.status?.toUpperCase() !== 'COMPLETED') {
          setError('You can only review a completed booking.');
          setLoading(false);
          return;
        }

        setBooking(data);
        setAlreadyReviewed(reviewRes.ok);
      } catch (err) {
        console.error(err);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [bookingId, router]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/auth/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId: Number(bookingId), rating, comment }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? 'Could not submit review');
      }
      toast.success('Thanks for your review!');
      router.push(`/bookings/${bookingId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not submit review');
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
              <p className="mt-3 text-ink-500 text-sm">Loading…</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-white rounded-3xl border border-cream-200 p-12 text-center">
              <AlertCircle className="w-10 h-10 mx-auto text-red-500" />
              <h1 className="mt-4 text-xl font-display font-bold text-ink-900">{error}</h1>
              <Link href="/bookings" className="mt-6 inline-block px-5 py-2.5 bg-plum-700 text-white text-sm font-semibold rounded-xl hover:bg-plum-800">
                Back to my bookings
              </Link>
            </div>
          )}

          {!loading && booking && alreadyReviewed && (
            <div className="bg-white rounded-3xl border border-cream-200 p-12 text-center">
              <Star className="w-10 h-10 mx-auto text-amber-400 fill-amber-400" />
              <h1 className="mt-4 text-xl font-display font-bold text-ink-900">Already reviewed</h1>
              <p className="mt-2 text-ink-500 text-sm">You&apos;ve already left a review for this booking.</p>
              <Link href={`/bookings/${bookingId}`} className="mt-6 inline-block px-5 py-2.5 bg-plum-700 text-white text-sm font-semibold rounded-xl hover:bg-plum-800">
                Back to booking
              </Link>
            </div>
          )}

          {!loading && booking && !alreadyReviewed && (
            <div className="bg-white rounded-3xl border border-cream-200 shadow-[0_12px_40px_-20px_rgba(122,38,65,0.15)] overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-cream-200">
                <p className="text-xs uppercase tracking-wider text-ink-400">Review your visit</p>
                <h1 className="mt-1 text-2xl font-display font-bold text-ink-900">{booking.serviceName}</h1>
                <p className="text-sm text-ink-500 mt-1">at {booking.salonName}</p>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-ink-900 mb-3">How was your experience?</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-10 h-10 ${
                            (hoverRating || rating) >= star
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-ink-300'
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="mt-2 text-sm text-ink-500">
                      {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-ink-900 mb-1.5">
                    Tell us more <span className="text-ink-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                    maxLength={2000}
                    placeholder="What did you love? What could be better?"
                    className="w-full px-4 py-3 bg-white border border-cream-200 rounded-xl text-ink-900 placeholder-ink-400 focus:border-plum-300 focus:ring-4 focus:ring-plum-100 transition-all outline-none text-sm resize-none"
                  />
                  <p className="text-xs text-ink-400 mt-1">{comment.length}/2000</p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || rating === 0}
                  className="w-full py-3 bg-plum-700 text-white font-semibold rounded-xl hover:bg-plum-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    'Submit review'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}