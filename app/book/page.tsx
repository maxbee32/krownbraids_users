'use client';

import { useState, useEffect, Suspense, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  ImagePlus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Salon, Service } from '../../lib/types';
import { resolveImageUrl } from '../../lib/imageUrl';

/* ------------------------------------------------------------------ */
/*  Helpers — build date & time options                                */
/* ------------------------------------------------------------------ */

function buildDateOptions(daysAhead = 30) {
  const options: { value: string; label: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const iso = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

    let prefix = '';
    if (i === 0) prefix = 'Today · ';
    else if (i === 1) prefix = 'Tomorrow · ';

    options.push({ value: iso, label: `${prefix}${label}` });
  }
  return options;
}

function buildTimeOptions() {
  const options: { value: string; label: string }[] = [];
  for (let hour = 9; hour <= 18; hour++) {
    for (const minute of [0, 30]) {
      if (hour === 18 && minute === 30) continue;
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      const value = `${h}:${m}`;

      const suffix = hour < 12 ? 'AM' : 'PM';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const label = `${displayHour}:${m} ${suffix}`;

      options.push({ value, label });
    }
  }
  return options;
}

/* ------------------------------------------------------------------ */
/*  Booking form                                                       */
/* ------------------------------------------------------------------ */

function BookPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const salonId = searchParams.get('salonId') ?? '';
  const serviceId = searchParams.get('serviceId') ?? '';
  const cameFromLogin = searchParams.get('welcome') === '1';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [salon, setSalon] = useState<Salon | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
  });

  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [serviceImageError, setServiceImageError] = useState(false);

  // "Welcome back" banner — only shown when arriving from login
  const [showWelcome, setShowWelcome] = useState(cameFromLogin);

  // Memoize dropdown options so they don't rebuild every render
  const dateOptions = useMemo(() => buildDateOptions(30), []);
  const timeOptions = useMemo(() => buildTimeOptions(), []);

  /* ---------- Auto-dismiss welcome banner ---------- */
  useEffect(() => {
    if (!showWelcome) return;
    const t = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(t);
  }, [showWelcome]);

  /* ---------- Auth gate ---------- */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      const current = window.location.pathname + window.location.search;
      router.replace(
        `/login?redirect=${encodeURIComponent(current)}&reason=book`
      );
    }
  }, [router]);

  /* ---------- Load salon + service ---------- */
  useEffect(() => {
    if (!salonId || !serviceId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [salonRes, servicesRes] = await Promise.all([
          fetch(`/api/auth/salons/${salonId}`, { cache: 'no-store' }),
          fetch(`/api/auth/services/salon/${salonId}`, { cache: 'no-store' }),
        ]);

        if (!salonRes.ok) {
          setNotFound(true);
          return;
        }

        const salonData = await salonRes.json();
        setSalon(salonData);

        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          const list = Array.isArray(servicesData)
            ? servicesData
            : servicesData.data ?? [];
          const found = list.find((s: Service) => s.id === serviceId);
          if (!found) {
            setNotFound(true);
            return;
          }
          setService(found);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Failed to load booking data:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [salonId, serviceId]);

  /* ---------- Cleanup image preview URLs ---------- */
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  /* ---------- Form handlers ---------- */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const incoming = Array.from(files);
    const total = referenceImages.length + incoming.length;

    if (total > 3) {
      toast.error('You can upload up to 3 reference images.');
      return;
    }

    setReferenceImages((prev) => [...prev, ...incoming]);
    setImagePreviews((prev) => [
      ...prev,
      ...incoming.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeImage = (index: number) => {
    const url = imagePreviews[index];
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);

    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------- Validation ---------- */
  const validate = (): string | null => {
    if (!form.customerName.trim()) return 'Your name is required';
    if (!form.customerEmail.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail))
      return 'Enter a valid email';
    if (!form.customerPhone.trim()) return 'Phone number is required';
    if (!form.appointmentDate) return 'Pick a date';
    if (!form.appointmentTime) return 'Pick a time';
    return null;
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!salon || !service) return;

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');

      const bookingData = {
        salonId: salon.id,
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.amount,
        durationMinutes: service.durationMinutes,
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim().toLowerCase(),
        customerPhone: form.customerPhone.trim(),
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        notes: form.notes.trim(),
      };

      let response: Response;

      if (referenceImages.length > 0) {
        const fd = new FormData();
        fd.append(
          'booking',
          new Blob([JSON.stringify(bookingData)], { type: 'application/json' }),
          'booking.json'
        );
        referenceImages.forEach((img) => fd.append('images', img));

        response = await fetch('/api/auth/bookings/with-images', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });
      } else {
        response = await fetch('/api/auth/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(bookingData),
        });
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(
          text.includes('<!DOCTYPE')
            ? 'Booking service unreachable. Please try again.'
            : `Unexpected response (${response.status})`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create booking');
      }

      setSuccess(true);
      toast.success('Booking requested — check your email.');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create booking';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-cream-50 py-12 px-4">
          <div className="container-custom text-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-plum-200 border-t-plum-700 mx-auto" />
            <p className="text-ink-500 mt-4 text-sm">Loading booking…</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  /* ---------- Not found ---------- */
  if (notFound || !salon || !service) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-cream-50 py-12 px-4">
          <div className="container-custom max-w-md mx-auto text-center py-24">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-plum-50 border border-plum-100 flex items-center justify-center text-3xl">
              🔍
            </div>
            <h1 className="text-2xl font-display font-bold text-ink-900">
              Booking not available
            </h1>
            <p className="text-ink-500 mt-2 text-sm">
              The salon or service you&apos;re trying to book doesn&apos;t exist
              or is no longer available.
            </p>
            <Link
              href="/salons"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-plum-700 text-white font-medium text-sm rounded-xl hover:bg-plum-800 transition-all"
            >
              Browse salons
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  /* ---------- Success ---------- */
  if (success) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-cream-50 py-12 px-4">
          <div className="container-custom max-w-md mx-auto">
            <div className="bg-white rounded-3xl border border-cream-200 p-8 sm:p-10 text-center shadow-[0_12px_40px_-20px_rgba(122,38,65,0.15)]">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>

              <h1 className="text-2xl font-display font-bold text-ink-900">
                Booking requested
              </h1>
              <p className="text-ink-500 mt-3 leading-relaxed">
                We&apos;ve sent the request to {salon.name}. They&apos;ll confirm
                your appointment by email shortly.
              </p>

              <div className="mt-6 p-4 bg-cream-50 rounded-2xl border border-cream-200 text-left text-sm">
                <p className="font-semibold text-ink-900 mb-2">
                  {service.name}
                </p>
                <p className="text-ink-500">
                  {new Date(form.appointmentDate).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}{' '}
                  at {form.appointmentTime}
                </p>
                <p className="text-ink-500/80 mt-1">
                  {service.durationMinutes} min · £{service.amount}
                </p>
              </div>

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
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  /* ---------- Main form ---------- */
  const inputClass =
    'w-full pl-11 pr-4 py-3 bg-white border border-cream-200 rounded-xl text-ink-900 placeholder-ink-400 focus:border-plum-300 focus:ring-4 focus:ring-plum-100 transition-all outline-none text-sm';
  const labelClass = 'block text-sm font-medium text-ink-900 mb-1.5';
  const iconClass =
    'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400';
  const selectClass =
    'w-full pl-11 pr-10 py-3 bg-white border border-cream-200 rounded-xl text-ink-900 focus:border-plum-300 focus:ring-4 focus:ring-plum-100 transition-all outline-none text-sm appearance-none cursor-pointer';

  return (
    <>
      <Header />

      <main className="min-h-screen bg-cream-50 py-10 px-4">
        <div className="container-custom max-w-5xl">
          {/* Back link */}
          <Link
            href={`/salons/${salon.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-plum-700 hover:text-plum-800 font-medium transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {salon.name}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* ───── Form ───── */}
            <div className="lg:col-span-3">
              {/* Welcome back banner (only when arriving from login) */}
              {showWelcome && (
                <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-emerald-800">
                      Welcome back — your booking is ready.
                    </p>
                    <p className="text-xs text-emerald-700/80 mt-0.5">
                      Fill in your details below to confirm your appointment.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWelcome(false)}
                    className="p-1 text-emerald-600 hover:text-emerald-800 transition-colors"
                    aria-label="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="mb-8">
                <p className="text-xs font-semibold tracking-[0.15em] text-rose-brand-600 uppercase mb-2">
                  New booking
                </p>
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink-900">
                  Book your appointment
                </h1>
                <p className="text-ink-500 mt-2">
                  Fill in your details and {salon.name} will confirm by email.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Your details */}
                <div className="bg-white rounded-2xl border border-cream-200 p-6 space-y-5 shadow-[0_8px_30px_-16px_rgba(122,38,65,0.10)]">
                  <h2 className="font-display font-bold text-ink-900 text-lg">
                    Your details
                  </h2>

                  <div>
                    <label htmlFor="customerName" className={labelClass}>
                      Full name *
                    </label>
                    <div className="relative">
                      <User className={iconClass} />
                      <input
                        id="customerName"
                        name="customerName"
                        type="text"
                        autoComplete="name"
                        value={form.customerName}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className={inputClass}
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="customerEmail" className={labelClass}>
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className={iconClass} />
                        <input
                          id="customerEmail"
                          name="customerEmail"
                          type="email"
                          autoComplete="email"
                          value={form.customerEmail}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className={inputClass}
                          disabled={submitting}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="customerPhone" className={labelClass}>
                        Phone *
                      </label>
                      <div className="relative">
                        <Phone className={iconClass} />
                        <input
                          id="customerPhone"
                          name="customerPhone"
                          type="tel"
                          autoComplete="tel"
                          value={form.customerPhone}
                          onChange={handleChange}
                          placeholder="+44 74828 12345"
                          className={inputClass}
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date & time — custom dropdowns */}
                <div className="bg-white rounded-2xl border border-cream-200 p-6 space-y-5 shadow-[0_8px_30px_-16px_rgba(122,38,65,0.10)]">
                  <h2 className="font-display font-bold text-ink-900 text-lg">
                    Date and time
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="appointmentDate" className={labelClass}>
                        Date *
                      </label>
                      <div className="relative">
                        <Calendar className={iconClass} />
                        <select
                          id="appointmentDate"
                          name="appointmentDate"
                          value={form.appointmentDate}
                          onChange={handleChange}
                          className={selectClass}
                          disabled={submitting}
                        >
                          <option value="">Select a date…</option>
                          {dateOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="appointmentTime" className={labelClass}>
                        Time *
                      </label>
                      <div className="relative">
                        <Clock className={iconClass} />
                        <select
                          id="appointmentTime"
                          name="appointmentTime"
                          value={form.appointmentTime}
                          onChange={handleChange}
                          className={selectClass}
                          disabled={submitting}
                        >
                          <option value="">Select a time…</option>
                          {timeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-ink-500">
                    The salon will confirm availability. If the slot isn&apos;t
                    free, they&apos;ll suggest alternatives.
                  </p>
                </div>

                {/* Try-on images */}
                <div className="bg-white rounded-2xl border border-cream-200 p-6 space-y-4 shadow-[0_8px_30px_-16px_rgba(122,38,65,0.10)]">
                  <div>
                    <h2 className="font-display font-bold text-ink-900 text-lg">
                      Try-on reference
                    </h2>
                    <p className="text-xs text-ink-500 mt-1">
                      Upload a photo of the style you want — from the try-on or
                      anywhere else. Optional, up to 3 images.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative w-24 h-24 rounded-xl overflow-hidden border border-cream-200 group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preview}
                          alt={`Reference ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-plum-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {imagePreviews.length < 3 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-xl border-2 border-dashed border-cream-300 hover:border-plum-400 transition-colors flex flex-col items-center justify-center gap-1 text-ink-500 hover:text-plum-700"
                      >
                        <ImagePlus className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Add</span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {/* Notes */}
                <div className="bg-white rounded-2xl border border-cream-200 p-6 space-y-4 shadow-[0_8px_30px_-16px_rgba(122,38,65,0.10)]">
                  <h2 className="font-display font-bold text-ink-900 text-lg">
                    Notes for the salon
                  </h2>

                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-ink-400" />
                    <textarea
                      name="notes"
                      rows={4}
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Hair length, allergies, what you're after, questions…"
                      className={`${inputClass} resize-none pt-3`}
                      disabled={submitting}
                    />
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
                  className="w-full py-4 bg-plum-700 text-white font-semibold rounded-2xl transition-all hover:bg-plum-800 hover:-translate-y-px active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 shadow-lg shadow-plum-700/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending request…
                    </>
                  ) : (
                    'Send booking request'
                  )}
                </button>

                <p className="text-xs text-ink-500 text-center">
                  You won&apos;t be charged now. {salon.name} will confirm the
                  appointment first.
                </p>
              </form>
            </div>

            {/* ───── Summary sidebar ───── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden sticky top-24 shadow-[0_12px_40px_-20px_rgba(122,38,65,0.18)]">
                {/* Service image — object-contain so the full image fits */}
                {(() => {
                  const imgSrc = resolveImageUrl(service.serviceImages?.[0]);
                  const showImg = Boolean(imgSrc) && !serviceImageError;

                  return (
                    <div className="relative h-56 bg-gradient-to-br from-rose-brand-50 via-plum-50 to-cream-50 overflow-hidden">
                      {showImg ? (
                        <Image
                          src={imgSrc}
                          alt={service.name}
                          fill
                          className="object-contain p-3"
                          sizes="(max-width: 1024px) 100vw, 400px"
                          onError={() => setServiceImageError(true)}
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl">✨</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.15em] text-rose-brand-600 uppercase mb-2">
                      You&apos;re booking
                    </p>
                    <h3 className="text-lg font-display font-bold text-ink-900">
                      {service.name}
                    </h3>
                    {service.category && (
                      <p className="text-xs text-ink-500 mt-0.5">
                        {service.category}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-cream-200 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-ink-500">Price</span>
                      <span className="font-display font-bold text-plum-700">
                        £{service.amount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ink-500">Duration</span>
                      <span className="text-ink-900">
                        {service.durationMinutes} min
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-cream-200">
                    <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">
                      At
                    </p>
                    <Link
                      href={`/salons/${salon.id}`}
                      className="block group"
                    >
                      <p className="font-semibold text-ink-900 group-hover:text-plum-700 transition-colors">
                        {salon.name}
                      </p>
                      {(salon.city || salon.country) && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-ink-400 flex-shrink-0" />
                          <p className="text-xs text-ink-500">
                            {[salon.city, salon.country]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        </div>
                      )}
                    </Link>
                  </div>

                  {form.appointmentDate && form.appointmentTime && (
                    <div className="pt-4 border-t border-cream-200">
                      <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">
                        When
                      </p>
                      <p className="text-sm text-ink-900 font-medium">
                        {new Date(
                          form.appointmentDate + 'T00:00:00'
                        ).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-ink-500">
                        at {form.appointmentTime}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page shell                                                         */
/* ------------------------------------------------------------------ */

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <>
          <Header />
          <main className="min-h-screen bg-cream-50 py-12 px-4">
            <div className="container-custom text-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-plum-200 border-t-plum-700 mx-auto" />
            </div>
          </main>
          <Footer />
        </>
      }
    >
      <BookPageContent />
    </Suspense>
  );
}