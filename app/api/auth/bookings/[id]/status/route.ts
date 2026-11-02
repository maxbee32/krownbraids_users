// app/api/auth/bookings/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BOOKING_SERVICE_URL ||
  'https://4ef0-82-36-98-104.ngrok-free.app/bservice';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = req.headers.get('authorization') ?? '';
    const status = req.nextUrl.searchParams.get('status') ?? '';

    const upstream = await fetch(
      `${BACKEND_URL}/api/v1/auth/bookings/${id}/status?status=${encodeURIComponent(status)}`,
      {
        method: 'PATCH',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          ...(auth ? { Authorization: auth } : {}),
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
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Proxy failed' },
      { status: 502 }
    );
  }
}