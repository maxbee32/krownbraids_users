// app/api/booking-details/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL =
  process.env.BOOKING_SERVICE_URL ||
  'https://2c9e-82-36-98-104.ngrok-free.app';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json(
        { message: 'Invalid booking id' },
        { status: 400 }
      );
    }

    const auth = req.headers.get('authorization') ?? '';
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const upstream = await fetch(
      `${GATEWAY_URL}/bookingservice/api/v1/auth/bookings/me/${id}`,
      {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          Authorization: auth,
          Accept: 'application/json',
        },
        cache: 'no-store',
      }
    );

    const contentType = upstream.headers.get('content-type') ?? '';
    const data = contentType.includes('application/json')
      ? await upstream.json()
      : { message: await upstream.text() };

    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.error('[booking-details] proxy failed:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Proxy failed' },
      { status: 502 }
    );
  }
}