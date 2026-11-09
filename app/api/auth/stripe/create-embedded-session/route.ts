// app/api/auth/stripe/create-embedded-session/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.PAYMENT_SERVICE_URL ||
  'https://2c9e-82-36-98-104.ngrok-free.app/pservice';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const auth = req.headers.get('authorization') ?? '';

    console.log('[stripe proxy] forwarding to:', `${BACKEND_URL}/api/v1/auth/stripe/create-embedded-session`);
    console.log('[stripe proxy] auth present:', Boolean(auth));
    console.log('[stripe proxy] body:', JSON.stringify(body));

    const upstream = await fetch(
      `${BACKEND_URL}/api/v1/auth/stripe/create-embedded-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(auth ? { Authorization: auth } : {}),
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      }
    );

    console.log('[stripe proxy] upstream status:', upstream.status);

    const contentType = upstream.headers.get('content-type') ?? '';
    const data = contentType.includes('application/json')
      ? await upstream.json()
      : { message: await upstream.text() };

    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.error('[stripe proxy] error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Proxy failed' },
      { status: 502 }
    );
  }
}