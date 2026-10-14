// app/login/page.tsx
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginForm from '../components/LoginForm';

export const metadata = {
  title: 'Sign in | Krown Braids',
  description: 'Sign in to your Krown Braids account.',
};

export default function LoginPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-stone-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-ink-900">
              Welcome back
            </h1>
            <p className="text-stone-600 mt-2">
              Sign in to your account to continue.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 sm:p-8">
            <LoginForm />
          </div>

          <p className="text-sm text-stone-600 text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-ink-900 hover:text-ink-700 font-semibold transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}