'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';

const OTP_LENGTH = 4;

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const otp = digits.join('');
  const isComplete = otp.length === OTP_LENGTH;

  const handleChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned && value !== '') return;

    if (cleaned.length > 1) {
      const next = [...digits];
      cleaned
        .slice(0, OTP_LENGTH - index)
        .split('')
        .forEach((d, i) => {
          next[index + i] = d;
        });
      setDigits(next);
      const nextIndex = Math.min(index + cleaned.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      if (error) setError(null);
      return;
    }

    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    if (error) setError(null);

    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        e.preventDefault();
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;

    const next = [...digits];
    pasted
      .slice(0, OTP_LENGTH - index)
      .split('')
      .forEach((d, i) => {
        next[index + i] = d;
      });
    setDigits(next);
    const nextIndex = Math.min(index + pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Your session expired. Please register again.');
      return;
    }
    if (!isComplete) {
      setError(`Please enter all ${OTP_LENGTH} digits.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp }),
      });

      const contentType = res.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        const raw = await res.text();
        console.error('Non-JSON response from verify-otp:', raw.slice(0, 200));
        throw new Error(
          raw.includes('<!DOCTYPE')
            ? 'The verification service is not reachable right now. Please try again.'
            : `Unexpected response (${res.status}).`
        );
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setSuccess(true);
      toast.success('Email verified!');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!token) {
      setError('Your session expired. Please register again.');
      return;
    }
    setResending(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = res.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        const raw = await res.text();
        throw new Error(
          raw.includes('<!DOCTYPE')
            ? 'The verification service is not reachable right now. Please try again.'
            : `Unexpected response (${res.status}).`
        );
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend code');
      }
      toast.success('A new code has been sent to your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-xl font-display font-semibold text-gray-900">
          Email verified
        </h2>
        <p className="text-gray-500 mt-2 text-sm">
          Redirecting you to sign in…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
          Verification code
        </label>

        <div className="flex items-center justify-center gap-3">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={(e) => handlePaste(i, e)}
              onFocus={(e) => e.target.select()}
              disabled={submitting}
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
              style={{
                width: '3.5rem',
                height: '3.5rem',
                minWidth: '3.5rem',
                minHeight: '3.5rem',
                flexShrink: 0,
              }}
              className="text-center text-2xl font-semibold bg-white border-2 border-cream-300 rounded-2xl text-gray-900 focus:border-amber-500 focus:ring-4 focus:ring-amber-400/15 outline-none transition-all disabled:opacity-60"
            />
          ))}
        </div>

        {email && (
          <p className="text-xs text-gray-500 mt-3 text-center">
            Sent to <span className="text-gray-700 font-medium">{email}</span>
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !isComplete}
        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-2xl transition-all hover:shadow-lg hover:shadow-amber-600/25 hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying…
          </>
        ) : (
          'Verify email'
        )}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-sm text-amber-700 hover:text-amber-800 font-medium transition-colors disabled:opacity-60"
        >
          {resending ? 'Sending…' : "Didn't get a code? Resend"}
        </button>
      </div>
    </form>
  );
}

export default function VerifyOtpPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-cream-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Check your email
            </h1>
            <p className="text-gray-500 mt-2">
              Enter the verification code we sent you.
            </p>
          </div>

          <div className="bg-cream-25 rounded-3xl shadow-sm border border-cream-200 p-6 sm:p-8">
            <Suspense
              fallback={
                <div className="text-center py-8 text-gray-500">Loading…</div>
              }
            >
              <VerifyOtpForm />
            </Suspense>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            <Link
              href="/register"
              className="text-amber-700 hover:text-amber-800 font-medium transition-colors"
            >
              Back to registration
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}