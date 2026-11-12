// lib/types.ts

/* ------------------------------------------------------------------ */
/*  Salon                                                              */
/* ------------------------------------------------------------------ */

export interface OpeningHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface WeeklyHours {
  monday: OpeningHours;
  tuesday: OpeningHours;
  wednesday: OpeningHours;
  thursday: OpeningHours;
  friday: OpeningHours;
  saturday: OpeningHours;
  sunday: OpeningHours;
}

export interface Salon {
  // Core
  id: number;
  ownerId: number;
  name: string;
  description?: string;

  // Contact
  email?: string;
  phoneNumber: string;
  website?: string;

  // Location
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;

  // Social
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;

  // ── Images (uploaded from dashboard → settings) ──
  logoUrl?: string;
  coverImageUrl?: string;

  // ── Opening hours & business rules ──
  openingHours?: WeeklyHours;
  timezone?: string;
  currency?: string;
  bookingBuffer?: number;
  maxBookingsPerDay?: number;
  cancellationPolicy?: string;
  termsAndConditions?: string;
  privacyPolicy?: string;

  // Meta
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED';
  createdAt: string;
  updatedAt?: string;
}

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export interface Service {
  id: string;
  salonId?: string;
  name: string;
  description?: string;
  amount: number;
  durationMinutes: number;
  category?: string;
  serviceImages?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Style / Category / Booking                                         */
/* ------------------------------------------------------------------ */

export interface Style {
  id: number;
  name: string;
  category: string;
  subcategory?: string;
  length: 'Short' | 'Medium' | 'Long' | 'Extra Long';
  price: number;
  duration: string;
  rating: number;
  reviews: number;
  image: string;
  popularity: number;
  isTrending?: boolean;
  isNew?: boolean;
  isMarketplace?: boolean;
  description?: string;
  termsAndConditions?: string;  
}

export interface Category {
  id: string;
  name: string;
  count?: number;
  icon?: string;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  notes: string;
}