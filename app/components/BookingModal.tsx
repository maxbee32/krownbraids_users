'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Style, BookingFormData } from '../types';
import { resolveImageUrl } from '../../lib/imageUrl';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  style: Style;
}

export default function BookingModal({
  isOpen,
  onClose,
  style,
}: BookingModalProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const thumbnailSrc = resolveImageUrl(style.image);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success(
        `✅ Booked ${style.name} successfully! We'll contact you shortly.`
      );
      setIsSubmitting(false);
      onClose();
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        notes: '',
      });
    }, 1500);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputClass =
    'w-full pl-10 pr-3 py-2.5 bg-white border border-cream-200 rounded-xl text-ink-900 placeholder-ink-400 focus:border-plum-300 focus:ring-4 focus:ring-plum-100 transition-all outline-none';
  const labelClass = 'block text-sm font-medium text-ink-700 mb-1.5';
  const iconClass =
    'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-900/55 backdrop-blur-md">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-[0_25px_60px_-15px_rgba(122,38,65,0.35)] border border-cream-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md rounded-t-3xl border-b border-cream-200 p-6 flex items-start justify-between z-10">
          <div className="flex items-start gap-4">
            {/* Style thumbnail — visual anchor */}
            {thumbnailSrc && (
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-cream-100 border border-cream-200 flex-shrink-0 hidden sm:block">
                <Image
                  src={thumbnailSrc}
                  alt={style.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                  unoptimized // remove in production
                />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-display font-bold text-ink-900">
                Book Appointment
              </h2>
              <p className="text-sm text-ink-500 mt-0.5">
                {style.name}
                <span className="mx-2 text-cream-300">•</span>
                <span className="text-plum-700 font-semibold">
                  £{style.price}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-plum-50 rounded-xl transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-ink-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <div className="relative">
                <User className={iconClass} />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email *</label>
              <div className="relative">
                <Mail className={iconClass} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Phone Number *</label>
            <div className="relative">
              <Phone className={iconClass} />
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className={inputClass}
                placeholder="+44 7442 853850"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date *</label>
              <div className="relative">
                <Calendar className={iconClass} />
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className={`${inputClass} [color-scheme:light]`}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Time *</label>
              <div className="relative">
                <Clock className={iconClass} />
                <input
                  type="time"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className={`${inputClass} [color-scheme:light]`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Special Notes</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-ink-400" />
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className={`${inputClass} resize-none pt-3`}
                placeholder="Any special requests or questions…"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-plum-700 text-white font-semibold rounded-2xl transition-all hover:bg-plum-800 hover:shadow-lg hover:shadow-plum-700/25 hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Booking…
                </>
              ) : (
                'Confirm Booking'
              )}
            </button>
            <p className="text-xs text-ink-400 text-center mt-3">
              You&apos;ll receive a confirmation email with appointment details
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}