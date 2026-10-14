'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const validate = (): string | null => {
    if (!form.firstName.trim()) return 'First name is required';
    if (!form.lastName.trim()) return 'Last name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return 'Enter a valid email';
    if (!form.phoneNumber.trim()) return 'Phone number is required';
    if (form.password.length < 8)
      return 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          phoneNumber: form.phoneNumber.trim(),
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
        throw new Error(data.message || 'Registration failed');
      }

      if (data.token) localStorage.setItem('authToken', data.token);
      if (data.userId) localStorage.setItem('userId', String(data.userId));
      if (data.role) localStorage.setItem('role', data.role);

      toast.success(
        'Account created. Check your email for the verification code.'
      );

      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Registration failed';
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
      {/* Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className={labelClass}>
            First name *
          </label>
          <div className="relative">
            <User className={iconClass} />
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Sam"
              className={inputClass}
              disabled={submitting}
            />
          </div>
        </div>
        <div>
          <label htmlFor="lastName" className={labelClass}>
            Last name *
          </label>
          <div className="relative">
            <User className={iconClass} />
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Owusu"
              className={inputClass}
              disabled={submitting}
            />
          </div>
        </div>
      </div>

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

      {/* Phone */}
      <div>
        <label htmlFor="phoneNumber" className={labelClass}>
          Phone number *
        </label>
        <div className="relative">
          <Phone className={iconClass} />
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            autoComplete="tel"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="+44 74828 12345"
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
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
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

      {/* Confirm password */}
      <div>
        <label htmlFor="confirmPassword" className={labelClass}>
          Confirm password *
        </label>
        <div className="relative">
          <Lock className={iconClass} />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            className={`${inputClass} pr-11`}
            disabled={submitting}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 transition-colors"
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            {showConfirm ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
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
            Creating account…
          </>
        ) : (
          'Create account'
        )}
      </button>

      <p className="text-xs text-stone-600 text-center">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-ink-900 hover:text-ink-700 font-semibold transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}