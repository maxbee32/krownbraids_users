// app/api/auth/marketplace/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Strip trailing slashes and accidental /pservice suffix so the env var can be either:
//   https://xxx.ngrok-free.app       or
//   https://xxx.ngrok-free.app/pservice
const BACKEND_URL = (
  process.env.PAYMENT_SERVICE_URL ||
  'https://60a6-82-36-98-104.ngrok-free.app'
)
  .replace(/\/+$/, '')
  .replace(/\/pservice$/, '');

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? '';
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const qs = req.nextUrl.searchParams.toString();
    // 👇 /pservice is added here explicitly — the env var must NOT include it
    const url = `${BACKEND_URL}/pservice/api/v1/auth/payments/marketplace/orders/me${
      qs ? `?${qs}` : ''
    }`;

    console.log('[orders] →', url);

    const res = await fetch(url, {
      headers: {
        Authorization: auth,
        Accept: 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'krownbraids-server/1.0',
      },
      cache: 'no-store',
    });

    const ct = res.headers.get('content-type') || '';
    const text = await res.text();

    console.log('[orders] ← status:', res.status);
    console.log('[orders] ← content-type:', ct);
    console.log('[orders] ← body (first 300):', text.slice(0, 300));

    if (!ct.includes('json')) {
      return NextResponse.json(
        {
          error: `Orders service returned non-JSON (${res.status})`,
          content_type: ct,
          raw_preview: text.slice(0, 500),
        },
        { status: 502 }
      );
    }

    // Pass through the backend JSON even on 4xx so the frontend sees the real error
    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch (err: any) {
    console.error('[orders] fetch failed:', err);
    return NextResponse.json(
      { error: `Proxy failed: ${err.message}` },
      { status: 502 }
    );
  }
}