'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
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
} from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Salon, Service } from '../../lib/types';

/* ------------------------------------------------------------------ */
/*  Booking form                                                       */
/* ------------------------------------------------------------------ */

function BookPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const salonId = searchParams.get('salonId') ?? '';
  const serviceId = searchParams.get('serviceId') ?? '';
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

    // Date can't be in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const picked = new Date(form.appointmentDate + 'T00:00:00');
    if (picked < today) return 'Please pick a future date';

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

      // Build the request. If there are images, use multipart.
      // Otherwise, plain JSON.
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
        <main className="min-h-screen bg-stone-50 py-12 px-4">
          <div className="container-custom text-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-stone-200 border-t-ink-800 mx-auto" />
            <p className="text-stone-500 mt-4 text-sm">Loading booking…</p>
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
        <main className="min-h-screen bg-stone-50 py-12 px-4">
          <div className="container-custom max-w-md mx-auto text-center py-24">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-3xl">
              🔍
            </div>
            <h1 className="text-2xl font-display font-bold text-ink-900">
              Booking not available
            </h1>
            <p className="text-stone-600 mt-2 text-sm">
              The salon or service you&apos;re trying to book doesn&apos;t exist
              or is no longer available.
            </p>
            <Link
              href="/salons"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-ink-900 text-white font-medium text-sm rounded-xl hover:bg-ink-800 transition-all"
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
        <main className="min-h-screen bg-stone-50 py-12 px-4">
          <div className="container-custom max-w-md mx-auto">
            <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>

              <h1 className="text-2xl font-display font-bold text-ink-900">
                Booking requested
              </h1>
              <p className="text-stone-600 mt-3 leading-relaxed">
                We&apos;ve sent the request to {salon.name}. They&apos;ll confirm
                your appointment by email shortly.
              </p>

              <div className="mt-6 p-4 bg-stone-50 rounded-2xl border border-stone-200 text-left text-sm">
                <p className="font-semibold text-ink-900 mb-2">
                  {service.name}
                </p>
                <p className="text-stone-600">
                  {new Date(form.appointmentDate).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}{' '}
                  at {form.appointmentTime}
                </p>
                <p className="text-stone-500 mt-1">
                  {service.durationMinutes} min · £{service.amount}
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/salons"
                  className="flex-1 py-2.5 text-sm font-semibold text-ink-900 border border-stone-300 rounded-xl hover:bg-stone-100 transition-all text-center"
                >
                  Browse more
                </Link>
                <Link
                  href="/"
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-ink-900 rounded-xl hover:bg-ink-800 transition-all text-center"
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
  const today = new Date().toISOString().split('T')[0];
  const inputClass =
    'w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-ink-900 placeholder-stone-400 focus:border-ink-700 focus:ring-4 focus:ring-ink-700/5 transition-all outline-none text-sm';
  const labelClass = 'block text-sm font-medium text-ink-900 mb-1.5';
  const iconClass =
    'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400';

  return (
    <>
      <Header />

      <main className="min-h-screen bg-stone-50 py-10 px-4">
        <div className="container-custom max-w-5xl">
          {/* Back link */}
          <Link
            href={`/salons/${salon.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-ink-700 hover:text-ink-900 font-medium transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {salon.name}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* ───── Form ───── */}
            <div className="lg:col-span-3">
              <div className="mb-8">
                <p className="text-xs font-semibold tracking-[0.15em] text-amber-700 uppercase mb-2">
                  New booking
                </p>
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink-900">
                  Book your appointment
                </h1>
                <p className="text-stone-600 mt-2">
                  Fill in your details and {salon.name} will confirm by email.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Your details */}
                <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
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

                {/* Date & time */}
                <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
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
                        <input
                          id="appointmentDate"
                          name="appointmentDate"
                          type="date"
                          min={today}
                          value={form.appointmentDate}
                          onChange={handleChange}
                          className={`${inputClass} [color-scheme:light]`}
                          disabled={submitting}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="appointmentTime" className={labelClass}>
                        Time *
                      </label>
                      <div className="relative">
                        <Clock className={iconClass} />
                        <input
                          id="appointmentTime"
                          name="appointmentTime"
                          type="time"
                          value={form.appointmentTime}
                          onChange={handleChange}
                          className={`${inputClass} [color-scheme:light]`}
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-500">
                    The salon will confirm availability. If the slot isn&apos;t
                    free, they&apos;ll suggest alternatives.
                  </p>
                </div>

                {/* Try-on images */}
                <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
                  <div>
                    <h2 className="font-display font-bold text-ink-900 text-lg">
                      Try-on reference
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Upload a photo of the style you want — from the try-on or
                      anywhere else. Optional, up to 3 images.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative w-24 h-24 rounded-xl overflow-hidden border border-stone-200 group"
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
                          className="absolute top-1 right-1 p-1 rounded-full bg-ink-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
                        className="w-24 h-24 rounded-xl border-2 border-dashed border-stone-300 hover:border-ink-500 transition-colors flex flex-col items-center justify-center gap-1 text-stone-500 hover:text-ink-700"
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
                <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
                  <h2 className="font-display font-bold text-ink-900 text-lg">
                    Notes for the salon
                  </h2>

                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
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
                  className="w-full py-4 bg-ink-900 text-white font-semibold rounded-2xl transition-all hover:bg-ink-800 hover:-translate-y-px active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
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

                <p className="text-xs text-stone-500 text-center">
                  You won&apos;t be charged now. {salon.name} will confirm the
                  appointment first.
                </p>
              </form>
            </div>

            {/* ───── Summary sidebar ───── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden sticky top-24">
                {/* Service image */}
                {service.serviceImages && service.serviceImages.length > 0 ? (
                  <div className="relative h-48 bg-stone-100">
                    <Image
                      src={service.serviceImages[0]}
                      alt={service.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 400px"
                      unoptimized={service.serviceImages[0].startsWith(
                        'http'
                      )}
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                    <span className="text-4xl">✨</span>
                  </div>
                )}

                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.15em] text-amber-700 uppercase mb-2">
                      You&apos;re booking
                    </p>
                    <h3 className="text-lg font-display font-bold text-ink-900">
                      {service.name}
                    </h3>
                    {service.category && (
                      <p className="text-xs text-stone-500 mt-0.5">
                        {service.category}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-stone-200 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600">Price</span>
                      <span className="font-display font-bold text-ink-900">
                        £{service.amount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600">Duration</span>
                      <span className="text-ink-900">
                        {service.durationMinutes} min
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-200">
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                      At
                    </p>
                    <Link
                      href={`/salons/${salon.id}`}
                      className="block group"
                    >
                      <p className="font-semibold text-ink-900 group-hover:text-ink-700 transition-colors">
                        {salon.name}
                      </p>
                      {(salon.city || salon.country) && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-stone-400 flex-shrink-0" />
                          <p className="text-xs text-stone-500">
                            {[salon.city, salon.country]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        </div>
                      )}
                    </Link>
                  </div>

                  {form.appointmentDate && form.appointmentTime && (
                    <div className="pt-4 border-t border-stone-200">
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
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
                      <p className="text-sm text-stone-600">
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
          <main className="min-h-screen bg-stone-50 py-12 px-4">
            <div className="container-custom text-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-stone-200 border-t-ink-800 mx-auto" />
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