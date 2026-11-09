// app/api/auth/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BOOKING_SERVICE_URL ||
  process.env.AUTH_SERVICE_URL ||        // ← fallback: you have this in .env
  'https://2c9e-82-36-98-104.ngrok-free.app/bookingservice';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const auth = req.headers.get('authorization') ?? '';

    const upstream = await fetch(`${BACKEND_URL}/api/v1/auth/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    return await relay(upstream);
  } catch (err) {
    console.error('[bookings POST] EXCEPTION:', err);
    return NextResponse.json(
      {
        message: err instanceof Error ? err.message : 'Proxy failed',
        stack: err instanceof Error ? err.stack : undefined,
      },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest) {
  console.log('[bookings GET] ─── start ───');
  console.log('[bookings GET] BACKEND_URL =', BACKEND_URL);

  try {
    const auth = req.headers.get('authorization') ?? '';
    console.log('[bookings GET] auth present =', !!auth);

    if (!auth.startsWith('Bearer ')) {
      console.log('[bookings GET] returning 401 (no bearer)');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = `${BACKEND_URL}/api/v1/auth/bookings/me`;
    console.log('[bookings GET] fetching', url);

    const upstream = await fetch(url, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        Authorization: auth,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    console.log('[bookings GET] upstream status =', upstream.status);
    console.log(
      '[bookings GET] upstream content-type =',
      upstream.headers.get('content-type')
    );

    return await relay(upstream);
  } catch (err) {
    console.error('[bookings GET] EXCEPTION:', err);
    return NextResponse.json(
      {
        message: err instanceof Error ? err.message : 'Proxy failed',
        stack: err instanceof Error ? err.stack : undefined,
      },
      { status: 502 }
    );
  }
}

/**
 * Read the upstream response as text first, then try to parse it as JSON.
 * This never throws on empty/non-JSON bodies (e.g. Spring 401/404 pages).
 */
async function relay(upstream: Response) {
  const text = await upstream.text();
  const contentType = upstream.headers.get('content-type') ?? '';

  let body: unknown;
  if (text.length === 0) {
    body = { message: `Empty response from backend (${upstream.status})` };
  } else if (contentType.includes('application/json')) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: 'Backend sent invalid JSON', raw: text.slice(0, 500) };
      return NextResponse.json(body, { status: 502 });
    }
  } else {
    body = {
      message: `Backend sent ${contentType || 'unknown content-type'}`,
      raw: text.slice(0, 500),
    };
    return NextResponse.json(body, { status: 502 });
  }

  return NextResponse.json(body, { status: upstream.status });
}