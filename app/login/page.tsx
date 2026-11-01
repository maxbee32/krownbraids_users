// app/login/page.tsx
'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Info } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginForm from '../components/LoginForm';

const REASON_COPY: Record<string, string> = {
  book: 'Sign in to continue booking your appointment.',
  wishlist: 'Sign in to save styles to your wishlist.',
  account: 'Sign in to view your account.',
};

function LoginPageContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '';
  const reason = searchParams.get('reason') || '';

  const reasonMessage = reason ? REASON_COPY[reason] : null;

  // Preserve both redirect and reason when sending to register
  const registerHref = redirectTo
    ? `/register?redirect=${encodeURIComponent(redirectTo)}${
        reason ? `&reason=${encodeURIComponent(reason)}` : ''
      }`
    : '/register';

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

      <div className="relative max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-display font-bold text-ink-900">
            Welcome back
          </h1>
          <p className="text-ink-500 mt-2">
            Sign in to your account to continue.
          </p>
        </div>

        {/* Contextual banner — explains why the user is here */}
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
                You&apos;ll be brought right back after signing in.
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
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-sm text-ink-500 text-center mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href={registerHref}
            className="text-plum-700 hover:text-plum-800 font-semibold transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
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
        <LoginPageContent />
      </Suspense>
      <Footer />
    </>
  );
}