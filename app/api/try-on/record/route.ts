import { NextRequest, NextResponse } from 'next/server';

const PAYMENT_URL =
  process.env.PAYMENT_SERVICE_URL ||
  'https://60a6-82-36-98-104.ngrok-free.app/pservice';

const INTERNAL_TOKEN =
  process.env.INTERNAL_SERVICE_TOKEN ?? 'change-me-super-secret-token';

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? '';
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    const upstream = await fetch(
      `${PAYMENT_URL}/api/v1/auth/try-on/record`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Token': INTERNAL_TOKEN,
          Authorization: auth,
          Accept: 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      }
    );

    const text = await upstream.text();
    const ct = upstream.headers.get('content-type') ?? '';

    if (text.length === 0) {
      return NextResponse.json({ ok: upstream.ok }, { status: upstream.status });
    }
    if (!ct.includes('application/json')) {
      return NextResponse.json(
        { error: 'Backend sent non-JSON', raw: text.slice(0, 300) },
        { status: 502 }
      );
    }

    return NextResponse.json(JSON.parse(text), { status: upstream.status });
  } catch (err) {
    console.error('[try-on/record] proxy failed:', err);
    return NextResponse.json({ error: 'Proxy failed' }, { status: 502 });
  }
}