import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BOOKING_SERVICE_URL ||
  'https://60a6-82-36-98-104.ngrok-free.app/bookingservice';

export async function PATCH(
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

    // Forward an optional cancellation reason if the client sends one
    let body: string | undefined;
    try {
      const incoming = await req.json();
      body = JSON.stringify(incoming);
    } catch {
      body = undefined;   // no body sent — that's fine
    }

    const upstream = await fetch(
      `${BACKEND_URL}/api/v1/auth/bookings/me/${id}/cancel`,
      {
        method: 'PATCH',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          Authorization: auth,
          Accept: 'application/json',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body } : {}),
        cache: 'no-store',
      }
    );

    const contentType = upstream.headers.get('content-type') ?? '';
    const text = await upstream.text();

    let data: unknown;
    if (text.length === 0) {
      data = { ok: upstream.ok };
    } else if (contentType.includes('application/json')) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: 'Backend sent invalid JSON', raw: text.slice(0, 500) };
        return NextResponse.json(data, { status: 502 });
      }
    } else {
      data = {
        message: `Backend sent ${contentType || 'unknown content-type'}`,
        raw: text.slice(0, 500),
      };
      return NextResponse.json(data, { status: 502 });
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.error('[bookings cancel] proxy failed:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Proxy failed' },
      { status: 502 }
    );
  }
}