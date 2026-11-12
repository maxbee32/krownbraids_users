import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.PAYMENT_SERVICE_URL ||
  'https://60a6-82-36-98-104.ngrok-free.app/pservice';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = `${BACKEND_URL}/api/v1/auth/payments/marketplace/checkout`;
  console.log('[checkout] → POST', url);

  try {
    const body = await req.text();
    console.log('[checkout] body length:', body.length);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
        'ngrok-skip-browser-warning': 'true',   // ← critical for ngrok free tier
        Accept: 'application/json',
      },
      body,
      cache: 'no-store',
    });

    console.log('[checkout] ← status:', res.status);
    console.log('[checkout] ← content-type:', res.headers.get('content-type'));

    const text = await res.text();
    console.log('[checkout] ← body (first 500):', text.slice(0, 500));

    const ct = res.headers.get('content-type') || '';

    if (!ct.includes('json')) {
      // Return the raw text so the frontend can show it
      return NextResponse.json(
        {
          error: `Payment service returned non-JSON (${res.status})`,
          content_type: ct,
          raw_preview: text.slice(0, 500),
          upstream_status: res.status,
        },
        { status: 502 }
      );
    }

    // Even if status is 4xx/5xx, if it's JSON we can pass it through
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          error: 'JSON parse failed',
          raw_preview: text.slice(0, 300),
        },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed, { status: res.status });
  } catch (err: any) {
    console.error('[checkout] fetch error:', err);
    return NextResponse.json(
      {
        error: `Fetch failed: ${err.message}`,
        url,
      },
      { status: 502 }
    );
  }
}