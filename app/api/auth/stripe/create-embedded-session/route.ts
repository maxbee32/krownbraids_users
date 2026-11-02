import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.PAYMENT_SERVICE_URL ||
  'https://7257-82-36-98-104.ngrok-free.app/bservice';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const auth = req.headers.get('authorization') ?? '';

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

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Proxy failed' },
      { status: 502 }
    );
  }
}