import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BOOKING_SERVICE_URL ||
  'https://2c9e-82-36-98-104.ngrok-free.app/bookingservice';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json({ message: 'Invalid booking id' }, { status: 400 });
    }

    const auth = req.headers.get('authorization') ?? '';
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const upstream = await fetch(
      `${BACKEND_URL}/api/v1/auth/bookings/me/${id}/reschedule`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          Authorization: auth,
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      }
    );

    const text = await upstream.text();
    const contentType = upstream.headers.get('content-type') ?? '';

    if (text.length === 0) {
      return NextResponse.json({ ok: upstream.ok }, { status: upstream.status });
    }
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { message: 'Backend sent non-JSON', raw: text.slice(0, 500) },
        { status: 502 }
      );
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { message: 'Invalid JSON from backend', raw: text.slice(0, 500) },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.error('[bookings reschedule] proxy failed:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Proxy failed' },
      { status: 502 }
    );
  }
}