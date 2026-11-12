// app/components/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '';

  const [form, setForm] = useState({ email: '', password: '' });
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

  const fetchAndCacheUser = async (token: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (!res.ok) return;

      const me = await res.json();

      if (me.firstName || me.lastName) {
        localStorage.setItem(
          'userName',
          `${me.firstName ?? ''} ${me.lastName ?? ''}`.trim()
        );
      }
      if (me.email) localStorage.setItem('userEmail', me.email);
      if (me.phoneNumber) localStorage.setItem('userPhone', me.phoneNumber);
    } catch (err) {
      console.warn('Failed to cache user profile:', err);
    }
  };

  const resolveRedirect = (raw: string): string => {
    if (!raw) return '';
    // Reject any auth page so we never loop
    if (raw.startsWith('/login') || raw.startsWith('/register')) return '';
    // Reject protocol-relative or absolute URLs
    if (/^https?:|^\/\//.test(raw)) return '';
    return raw;
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

      // Persist auth state before any navigation
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('adminToken', data.token);
      }
      if (data.userId) localStorage.setItem('userId', String(data.userId));
      if (data.role) localStorage.setItem('role', data.role);

      if (data.token) {
        await fetchAndCacheUser(data.token);
      }

      window.dispatchEvent(new Event('storage'));

      toast.success('Signed in successfully.');

      // Sanitize destination — cannot be /login or /register
      const safeRedirect = resolveRedirect(redirectTo);

      if (safeRedirect) {
        const sep = safeRedirect.includes('?') ? '&' : '?';
        const url = /[?&]welcome=1(&|$)/.test(safeRedirect)
          ? safeRedirect
          : `${safeRedirect}${sep}welcome=1`;
        window.location.href = url;
        return;
      }

      // No safe redirect — route by role
      const role = (data.role ?? '').toString().toUpperCase();
      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      toast.error(message);
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full pl-11 pr-4 py-3.5 bg-espresso-50 border border-espresso-200 rounded-xl text-espresso-950 placeholder-espresso-400 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/15 transition-all outline-none text-sm';
  const labelClass = 'block text-sm font-semibold text-espresso-900 mb-1.5';
  const iconClass =
    'absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso-400';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className={labelClass}>
          Email Address
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

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor="password" className={`${labelClass} mb-0`}>
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-primary-600 hover:text-primary-700 font-semibold transition-colors"
          >
            Forgot password?
          </Link>
        </div>
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
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-espresso-400 hover:text-espresso-900 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 bg-espresso-950 text-white font-bold rounded-xl transition-all hover:bg-primary-500 hover:text-espresso-950 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-espresso-950/10"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Signing in…
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
}