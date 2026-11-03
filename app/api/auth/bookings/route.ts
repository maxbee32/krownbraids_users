// app/api/auth/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BOOKING_SERVICE_URL ||
  'https://9277-82-36-98-104.ngrok-free.app/bookingservice';

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

    const contentType = upstream.headers.get('content-type') ?? '';
    const data = contentType.includes('application/json')
      ? await upstream.json()
      : { message: await upstream.text() };

    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.error('[bookings POST] error:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Proxy failed' },
      { status: 502 }
    );
  }
}