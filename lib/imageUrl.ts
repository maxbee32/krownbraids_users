// lib/imageUrl.ts

export function resolveImageUrl(path?: string | null): string {
  if (!path || !path.trim()) return '';
  const raw = path.trim();

  // Absolute URL (services-service)
  if (/^https?:\/\//i.test(raw)) {
    const match = raw.match(/\/api\/v1\/auth\/images\/services\/(.+)$/i);
    if (match && match[1]) return `/api/uploads/service/${match[1]}`;
    return '';
  }

  // Relative "/<salonId>/<fileName>" (salon images)
  if (/^\/\d+\/[^/]+$/.test(raw)) {
    return `/api/uploads/salon/${raw.replace(/^\//, '')}`;
  }

  // Unknown shape
  return '';
}

/**
 * Resolve a booking reference image. The backend stores only the bare
 * filename (e.g. "abc123.jpg"), so we need the booking ID to build the URL.
 */
export function resolveBookingImageUrl(
  bookingId: number | string,
  filename?: string | null
): string {
  if (!filename || !filename.trim()) return '';
  const clean = filename.trim().replace(/^\//, '');
  return `/api/uploads/bookings/${bookingId}/${clean}`;
}