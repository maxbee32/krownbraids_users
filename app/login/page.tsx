// app/login/page.tsx
'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Info } from 'lucide-react';
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
    <main className="relative min-h-screen bg-espresso-50 py-12 px-4 overflow-hidden">
      
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] opacity-[0.15]">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-400 via-espresso-400 to-transparent blur-3xl" />
        </div>
      </div>

      <div className="relative max-w-md mx-auto">
        {/* Back to home link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-espresso-500 hover:text-espresso-950 font-medium transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-espresso-950">
            Welcome back
          </h1>
          <p className="text-espresso-500 mt-2">
            Sign in to your account to continue.
          </p>
        </div>

        {/* Contextual banner — explains why the user is here */}
        {reasonMessage && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-primary-50 border border-primary-200">
            <div className="w-9 h-9 rounded-xl bg-white border border-primary-100 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Info className="w-4 h-4 text-primary-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-espresso-950">
                {reasonMessage}
              </p>
              <p className="text-xs text-espresso-600 mt-0.5">
                You&apos;ll be brought right back after signing in.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(42,34,31,0.1)] border border-espresso-100 p-6 sm:p-8">
          <Suspense
            fallback={
              <div className="text-center py-8 text-espresso-500">Loading…</div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-sm text-espresso-500 text-center mt-8">
          Don&apos;t have an account?{' '}
          <Link
            href={registerHref}
            className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
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
          <main className="relative min-h-screen bg-espresso-50 py-12 px-4">
            <div className="container-custom text-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-espresso-200 border-t-primary-500 mx-auto" />
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