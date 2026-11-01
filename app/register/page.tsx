// app/register/page.tsx
'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Info } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RegisterForm from '../components/RegisterForm';

const REASON_COPY: Record<string, string> = {
  book: 'Create an account to complete your booking.',
  wishlist: 'Create an account to save styles to your wishlist.',
  account: 'Create an account to get started.',
};

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || '';
  const redirectTo = searchParams.get('redirect') || '';

  const reasonMessage = reason ? REASON_COPY[reason] : null;

  // Preserve redirect + reason when linking to sign-in
  const loginHref = redirectTo
    ? `/login?redirect=${encodeURIComponent(redirectTo)}${
        reason ? `&reason=${encodeURIComponent(reason)}` : ''
      }`
    : '/login';

  return (
    <main className="relative min-h-screen bg-cream-50 py-12 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] opacity-[0.28]">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-brand-200 via-plum-100 to-transparent blur-3xl" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.3] mix-blend-soft-light"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #7a2641 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-display font-bold text-ink-900">
            Create your account
          </h1>
          <p className="text-ink-500 mt-2">
            Join Krown Braids and start booking braiding appointments.
          </p>
        </div>

        {/* Contextual banner */}
        {reasonMessage && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-plum-50 border border-plum-100">
            <div className="w-9 h-9 rounded-xl bg-white border border-plum-200 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-plum-700" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-plum-800">
                {reasonMessage}
              </p>
              <p className="text-xs text-plum-700/80 mt-0.5">
                We&apos;ll bring you right back after you verify your email.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-[0_12px_40px_-16px_rgba(122,38,65,0.18)] border border-cream-200 p-6 sm:p-8">
          <Suspense
            fallback={
              <div className="text-center py-8 text-ink-500">Loading…</div>
            }
          >
            <RegisterForm />
          </Suspense>
        </div>

        <p className="text-xs text-ink-500 text-center mt-6">
          By creating an account you agree to our{' '}
          <Link
            href="/terms"
            className="text-plum-700 hover:text-plum-800 font-medium transition-colors"
          >
            Terms
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            className="text-plum-700 hover:text-plum-800 font-medium transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <p className="text-sm text-ink-500 text-center mt-4">
          Already have an account?{' '}
          <Link
            href={loginHref}
            className="text-plum-700 hover:text-plum-800 font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <main className="relative min-h-screen bg-cream-50 py-12 px-4">
            <div className="container-custom text-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-plum-200 border-t-plum-700 mx-auto" />
            </div>
          </main>
        }
      >
        <RegisterPageContent />
      </Suspense>
      <Footer />
    </>
  );
}