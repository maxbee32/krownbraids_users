// app/bookings/[id]/review/page.tsx
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

const RATING_FEEDBACK: Record<number, { label: string; emoji: string }> = {
  1: { label: 'Poor', emoji: '😞' },
  2: { label: 'Fair', emoji: '😕' },
  3: { label: 'Good', emoji: '🙂' },
  4: { label: 'Great', emoji: '😊' },
  5: { label: 'Amazing', emoji: '🤩' },
};

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

  const activeRating = hoverRating || rating;
  const feedback = RATING_FEEDBACK[activeRating];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-espresso-50 py-12 px-4">
        <div className="container-custom max-w-md mx-auto">
          <Link
            href={`/bookings/${bookingId}`}
            className="inline-flex items-center gap-1.5 text-sm text-espresso-500 hover:text-espresso-950 font-medium transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to booking
          </Link>

          {loading && (
            <div className="bg-white rounded-3xl border border-espresso-100 p-16 text-center">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary-500" />
              <p className="mt-4 text-espresso-500 text-sm">Loading…</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-white rounded-3xl border border-espresso-100 p-12 text-center">
              <AlertCircle className="w-10 h-10 mx-auto text-red-500" />
              <h1 className="mt-4 text-xl font-display font-bold text-espresso-950">
                {error}
              </h1>
              <Link
                href="/bookings"
                className="mt-6 inline-block px-5 py-2.5 bg-espresso-950 text-white text-sm font-semibold rounded-xl hover:bg-primary-500 hover:text-espresso-950 transition-colors"
              >
                Back to my bookings
              </Link>
            </div>
          )}

          {!loading && booking && alreadyReviewed && (
            <div className="bg-white rounded-3xl border border-espresso-100 p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center">
                <Star className="w-8 h-8 text-primary-500 fill-primary-500" />
              </div>
              <h1 className="mt-6 text-xl font-display font-bold text-espresso-950">
                Already reviewed
              </h1>
              <p className="mt-2 text-espresso-500 text-sm">
                You&apos;ve already left a review for this booking.
              </p>
              <Link
                href={`/bookings/${bookingId}`}
                className="mt-6 inline-block px-5 py-2.5 bg-espresso-950 text-white text-sm font-semibold rounded-xl hover:bg-primary-500 hover:text-espresso-950 transition-colors"
              >
                Back to booking
              </Link>
            </div>
          )}

          {!loading && booking && !alreadyReviewed && (
            <div className="bg-white rounded-[2rem] border border-espresso-100 shadow-[0_30px_80px_-30px_rgba(42,34,31,0.2)] overflow-hidden">
              
              {/* Header — clean, centered, no icons besides the star badge */}
              <div className="px-6 sm:px-8 pt-10 pb-8 text-center border-b border-espresso-100">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center mb-5">
                  <Star className="w-8 h-8 text-primary-500 fill-primary-500" />
                </div>
                <h1 className="text-2xl font-display font-bold text-espresso-950">
                  How was your visit?
                </h1>
                <p className="text-sm text-espresso-500 mt-2">
                  {booking.serviceName} · {booking.salonName}
                </p>
              </div>

              <div className="p-6 sm:p-8 space-y-8">
                
                {/* Stars */}
                <div>
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = activeRating >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110 active:scale-95"
                          aria-label={`${star} star${star > 1 ? 's' : ''}`}
                        >
                          <Star
                            className={`w-12 h-12 transition-all duration-150 ${
                              isActive
                                ? 'fill-primary-500 text-primary-500'
                                : 'text-espresso-200'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Emoji feedback */}
                  <div className="mt-4 h-8 text-center">
                    {feedback && (
                      <p className="text-sm font-semibold text-espresso-950">
                        <span className="text-lg mr-1.5">{feedback.emoji}</span>
                        {feedback.label}
                      </p>
                    )}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label
                    htmlFor="comment"
                    className="block text-sm font-semibold text-espresso-900 mb-1.5"
                  >
                    Tell us more{' '}
                    <span className="text-espresso-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    maxLength={2000}
                    placeholder="What did you love? What could be better?"
                    className="w-full px-4 py-3.5 bg-espresso-50 border border-espresso-200 rounded-2xl text-espresso-950 placeholder-espresso-400 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/15 transition-all outline-none text-sm resize-none"
                  />
                  <div className="mt-1.5 flex justify-end">
                    <p className="text-xs text-espresso-400">
                      {comment.length}/2000
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || rating === 0}
                  className="w-full py-4 bg-espresso-950 text-white font-bold rounded-full hover:bg-primary-500 hover:text-espresso-950 transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-lg shadow-espresso-950/10"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    'Submit Review'
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