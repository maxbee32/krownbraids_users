// lib/imageUrl.ts

/**
 * Route backend image paths to the correct Next.js proxy.
 *
 * Backend returns two shapes for image paths:
 *
 *   1. Salon cover/logo/profile images (business-service):
 *        "/<salonId>/<fileName>"
 *        e.g. "/40019/148706e0-9ed6-41ae-a13a-0cde4da0abc4.jpg"
 *      → Routed through /api/uploads/salon/[...path]
 *
 *   2. Service images (services-service):
 *        "https://<host>/api/v1/auth/images/services/<salonId>/<file>"
 *        e.g. "https://1f9b-82-36-98-104.ngrok-free.app/api/v1/auth/images/services/10020/07ad7812-...jpeg"
 *      → Extract "<salonId>/<file>" and route through /api/uploads/service/[...path]
 *
 * Any unrecognized shape returns '' so the component renders the fallback.
 */
export function resolveImageUrl(path?: string | null): string {
  if (!path || !path.trim()) return '';

  const raw = path.trim();

  // ─── Case 1: Absolute URL (services-service stored a full URL) ───
  if (/^https?:\/\//i.test(raw)) {
    // Match ".../api/v1/auth/images/services/<rest>"
    const match = raw.match(/\/api\/v1\/auth\/images\/services\/(.+)$/i);
    if (match && match[1]) {
      return `/api/uploads/service/${match[1]}`;
    }
    // Unknown absolute URL shape → no proxy available
    return '';
  }

  // ─── Case 2: Relative path "/<salonId>/<fileName>" (salon images) ───
  if (/^\/\d+\/[^/]+$/.test(raw)) {
    return `/api/uploads/salon/${raw.replace(/^\//, '')}`;
  }

  // ─── Unknown shape ───
  return '';
}