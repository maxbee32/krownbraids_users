// lib/types.ts

export interface Salon {
  id: number;
  ownerId: number;
  name: string;
  description?: string;
  email?: string;
  phoneNumber: string;
  website?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED';
  createdAt: string;
  updatedAt?: string;
}

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