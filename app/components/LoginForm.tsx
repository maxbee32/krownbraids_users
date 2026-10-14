'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const validate = (): string | null => {
    if (!form.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return 'Enter a valid email';
    if (!form.password) return 'Password is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(
          text.includes('<!DOCTYPE')
            ? 'The server returned an HTML page. Check that the backend tunnel is running.'
            : `Unexpected response (${response.status})`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Sign in failed');
      }

      if (data.token) localStorage.setItem('authToken', data.token);
      if (data.userId) localStorage.setItem('userId', String(data.userId));
      if (data.role) localStorage.setItem('role', data.role);

      window.dispatchEvent(new Event('storage'));

      toast.success('Signed in successfully.');

      const role = (data.role ?? '').toString().toUpperCase();
      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-ink-900 placeholder-stone-400 focus:border-ink-700 focus:ring-4 focus:ring-ink-700/5 transition-all outline-none text-sm';
  const labelClass = 'block text-sm font-medium text-ink-900 mb-1.5';
  const iconClass =
    'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClass}>
          Email *
        </label>
        <div className="relative">
          <Mail className={iconClass} />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={inputClass}
            disabled={submitting}
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className={labelClass}>
          Password *
        </label>
        <div className="relative">
          <Lock className={iconClass} />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            placeholder="Your password"
            className={`${inputClass} pr-11`}
            disabled={submitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Forgot password link */}
      <div className="flex justify-end -mt-2">
        <Link
          href="/forgot-password"
          className="text-xs text-ink-700 hover:text-ink-900 font-medium transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 bg-ink-900 text-white font-semibold rounded-2xl transition-all hover:bg-ink-800 hover:-translate-y-px active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Signing in…
          </>
        ) : (
          'Sign in'
        )}
      </button>
    </form>
  );
}