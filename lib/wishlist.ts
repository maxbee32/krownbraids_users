// lib/wishlist.ts

export interface WishlistItem {
  id: string;          // service id (or style id)
  type: 'style' | 'service';
  name: string;
  image?: string;
  price?: number;
  category?: string;
  salonId?: number | string;
  salonName?: string;
  addedAt: number;
}

const KEY = 'wishlist';
const EVENT = 'wishlist:changed';

export function getWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(items: WishlistItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(items));
  // Same-tab listeners: storage events don't fire for same-tab mutations
  window.dispatchEvent(new Event(EVENT));
  // Cross-tab listeners still get the native storage event
  window.dispatchEvent(new Event('storage'));
}

export function isInWishlist(id: string): boolean {
  return getWishlist().some((x) => x.id === id);
}

export function addToWishlist(item: Omit<WishlistItem, 'addedAt'>): void {
  const items = getWishlist();
  if (items.some((x) => x.id === item.id)) return;
  items.unshift({ ...item, addedAt: Date.now() });
  save(items);
}

export function removeFromWishlist(id: string): void {
  save(getWishlist().filter((x) => x.id !== id));
}

export function toggleWishlist(item: Omit<WishlistItem, 'addedAt'>): boolean {
  const exists = isInWishlist(item.id);
  if (exists) removeFromWishlist(item.id);
  else addToWishlist(item);
  return !exists; // true if now in wishlist
}

export function clearWishlist(): void {
  save([]);
}

export function getWishlistCount(): number {
  return getWishlist().length;
}

/**
 * Subscribe to wishlist changes — fires for same-tab, cross-tab,
 * and manual event triggers. Returns an unsubscribe function.
 */
export function subscribeWishlist(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export const WISHLIST_EVENT = EVENT;