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