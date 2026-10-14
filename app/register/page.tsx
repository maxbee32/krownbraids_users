// app/register/page.tsx
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RegisterForm from '../components/RegisterForm';

export const metadata = {
  title: 'Create your account | Krown Braids',
  description: 'Sign up to book braiding appointments.',
};

export default function RegisterPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-stone-50 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-ink-900">
              Create your account
            </h1>
            <p className="text-stone-600 mt-2">
              Join Krown Braids and start booking braiding appointments.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 sm:p-8">
            <RegisterForm />
          </div>

          <p className="text-xs text-stone-600 text-center mt-6">
            By creating an account you agree to our{' '}
            <Link
              href="/terms"
              className="text-ink-900 hover:text-ink-700 font-medium transition-colors"
            >
              Terms
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="text-ink-900 hover:text-ink-700 font-medium transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}