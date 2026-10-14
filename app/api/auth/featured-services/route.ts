import { NextResponse } from 'next/server';

const BUSINESS_BASE =
  'https://58bb-82-36-98-104.ngrok-free.app/bservice';
const SERVICES_BASE =
  'https://58bb-82-36-98-104.ngrok-free.app/servicesservice';

/* ─────────────────────────────────────────────────────────────
   Cache — 60 seconds.
   The home page may be loaded many times per minute, but we only
   want to hit ngrok once per minute.
   ───────────────────────────────────────────────────────────── */
let cached: { data: { services: any[] }; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

export async function GET() {
  // Return cached result if still fresh
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data);
  }

  try {
    // 1. Fetch salons
    const salonsRes = await fetch(
      `${BUSINESS_BASE}/api/v1/auth/business/salons/get-all-salons`,
      {
        cache: 'no-store',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'KrownBraids-Frontend/1.0',
        },
      }
    );

    if (!salonsRes.ok) {
      return NextResponse.json({ services: [] });
    }

    const salons = await salonsRes.json();
    const activeSalons = Array.isArray(salons)
      ? salons.filter((s: any) => s.status === 'ACTIVE')
      : [];

    // 2. Sort by plan tier — higher selectedPlanId = higher priority.
    //    If IDs aren't strictly ordered by tier, map them explicitly.
    const priority = (planId: number | null | undefined): number => {
      switch (planId) {
        case 4: return 4;   // PREMIUM
        case 3: return 3;   // PROFESSIONAL
        case 2: return 2;   // BASIC
        case 1: return 1;   // TRIAL
        default: return 1;
      }
    };

    const sortedSalons = [...activeSalons].sort(
      (a, b) => priority(b.selectedPlanId) - priority(a.selectedPlanId)
    );

    // 3. Take a pool of top salons
    const salonPool = sortedSalons.slice(0, 12);

    // 4. Fetch services for each salon
    const groups = await Promise.all(
      salonPool.map(async (salon: any) => {
        try {
          const res = await fetch(
            `${SERVICES_BASE}/api/v1/auth/services/public/salon/${salon.id}`,
            {
              cache: 'no-store',
              headers: {
                'ngrok-skip-browser-warning': 'true',
                'User-Agent': 'KrownBraids-Frontend/1.0',
              },
            }
          );
          if (!res.ok) return [];
          const json = await res.json();
          const list = Array.isArray(json) ? json : json.data ?? [];

          return list.map((s: any) => ({
            id: s.id,
            name: s.name,
            amount: s.amount,
            durationMinutes: s.durationMinutes,
            category: s.category,
            serviceImages: s.serviceImages ?? [],
            salonId: salon.id,
            salonName: salon.name,
            salonCity: salon.city,
            planPriority: priority(salon.selectedPlanId),
          }));
        } catch {
          return [];
        }
      })
    );

    const allServices = groups.flat();

    // 5. Keep only services with at least one image
    const withImages = allServices.filter(
      (s: any) =>
        Array.isArray(s.serviceImages) && s.serviceImages.length > 0
    );

    // 6. Group by tier, shuffle within each, concatenate in tier order
    const tiers: Record<number, any[]> = {};
    for (const s of withImages) {
      const t = s.planPriority ?? 1;
      if (!tiers[t]) tiers[t] = [];
      tiers[t].push(s);
    }

    const orderedTiers = Object.keys(tiers)
      .map(Number)
      .sort((a, b) => b - a);

    const result: any[] = [];
    for (const t of orderedTiers) {
      result.push(...shuffle(tiers[t]));
    }

    const data = { services: result.slice(0, 8) };
    cached = { data, expiresAt: Date.now() + CACHE_TTL_MS };

    return NextResponse.json(data);
  } catch (err) {
    console.error('featured-services failed:', err);
    return NextResponse.json({ services: [] }, { status: 500 });
  }
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}