// app/api/auth/salons/public/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BUSINESS_URL = (
  process.env.BUSINESS_SERVICE_URL ||
  'https://60a6-82-36-98-104.ngrok-free.app'
)
  .replace(/\/+$/, '')
  .replace(/\/bservice$/, '');

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const url = `${BUSINESS_URL}/bservice/api/v1/auth/business/salons/public/${id}`;

    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'krownbraids-server/1.0',
      },
      cache: 'no-store',
    });

    const text = await res.text();
    const ct = res.headers.get('content-type') || '';

    if (!ct.includes('json')) {
      return NextResponse.json(
        { error: `Backend returned non-JSON (${res.status})` },
        { status: 502 }
      );
    }

    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}