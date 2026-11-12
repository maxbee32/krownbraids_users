import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BOOKING_SERVICE_URL ||
  'https://60a6-82-36-98-104.ngrok-free.app/bookingservice';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const auth = req.headers.get('authorization') ?? '';
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const upstream = await fetch(
      `${BACKEND_URL}/api/v1/auth/reviews/booking/${bookingId}`,
      {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          Authorization: auth,
          Accept: 'application/json',
        },
        cache: 'no-store',
      }
    );

    const text = await upstream.text();
    const ct = upstream.headers.get('content-type') ?? '';
    if (text.length === 0) {
      return NextResponse.json({ ok: upstream.ok }, { status: upstream.status });
    }
    if (!ct.includes('application/json')) {
      return NextResponse.json({ error: 'Backend sent non-JSON' }, { status: 502 });
    }
    return NextResponse.json(JSON.parse(text), { status: upstream.status });
  } catch (err) {
    console.error('[review-by-booking GET] proxy failed:', err);
    return NextResponse.json({ error: 'Proxy failed' }, { status: 502 });
  }
}