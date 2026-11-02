'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id') ?? '';

  const [verifying, setVerifying] = useState(true);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('Missing payment session reference.');
      setVerifying(false);
      return;
    }

    let attempts = 0;
    const MAX = 15; // 15 × 2s = 30s max

    const check = async () => {
      attempts++;
      try {
        const res = await fetch(`/api/auth/stripe/verify/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'SUCCESS') {
            setOk(true);
            setVerifying(false);
            setBookingId(data.bookingId ?? null);
            setAmount(data.amount ?? null);
            return;
          }
        }
      } catch (err) {
        console.warn('Verification attempt failed:', err);
      }

      if (attempts < MAX) {
        setTimeout(check, 2000);
      } else {
        setVerifying(false);
        setError(null); // show "processing" state, not error
      }
    };

    check();
  }, [sessionId]);

  return (
    <main className="min-h-screen bg-cream-50 py-12 px-4">
      <div className="container-custom max-w-md mx-auto">
        <div className="bg-white rounded-3xl border border-cream-200 p-8 sm:p-10 text-center shadow-[0_12px_40px_-20px_rgba(122,38,65,0.15)]">
          {verifying ? (
            <>
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-plum-50 border border-plum-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-plum-700 animate-spin" />
              </div>
              <h1 className="text-2xl font-display font-bold text-ink-900">
                Confirming your payment…
              </h1>
              <p className="text-ink-500 mt-3 leading-relaxed text-sm">
                This usually takes a few seconds. Please don&apos;t close this page.
              </p>
            </>
          ) : ok ? (
            <>
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-display font-bold text-ink-900">
                Booking confirmed
              </h1>
              <p className="text-ink-500 mt-3 leading-relaxed">
                Your payment was successful. The salon will confirm your
                appointment shortly — check your email for details.
              </p>

              {(bookingId || amount) && (
                <div className="mt-6 p-4 bg-cream-50 rounded-2xl border border-cream-200 text-left text-sm">
                  {bookingId && (
                    <div className="flex items-center justify-between">
                      <span className="text-ink-500">Booking</span>
                      <span className="font-medium text-ink-900">
                        #{bookingId}
                      </span>
                    </div>
                  )}
                  {amount && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-ink-500">Amount paid</span>
                      <span className="font-display font-bold text-plum-700">
                        £{amount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/salons"
                  className="flex-1 py-2.5 text-sm font-semibold text-plum-700 border border-plum-200 rounded-xl hover:bg-plum-50 transition-all text-center"
                >
                  Browse more
                </Link>
                <Link
                  href="/"
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-plum-700 rounded-xl hover:bg-plum-800 transition-all text-center"
                >
                  Back to home
                </Link>
              </div>
            </>
          ) : error ? (
            <>
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-display font-bold text-ink-900">
                Something went wrong
              </h1>
              <p className="text-ink-500 mt-3 leading-relaxed text-sm">
                {error}
              </p>
              <Link
                href="/salons"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-plum-700 text-white font-medium text-sm rounded-xl hover:bg-plum-800 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to salons
              </Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber-600" />
              </div>
              <h1 className="text-2xl font-display font-bold text-ink-900">
                Payment processing
              </h1>
              <p className="text-ink-500 mt-3 leading-relaxed text-sm">
                We&apos;ve received your payment but our system is still
                confirming it. You&apos;ll get an email within a few minutes.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-plum-700 text-white font-medium text-sm rounded-xl hover:bg-plum-800 transition-all"
              >
                Back to home
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function BookSuccessPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <main className="min-h-screen bg-cream-50 py-12 px-4">
            <div className="container-custom text-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-plum-200 border-t-plum-700 mx-auto" />
            </div>
          </main>
        }
      >
        <SuccessContent />
      </Suspense>
      <Footer />
    </>
  );
}