import { NextRequest, NextResponse } from 'next/server';

const PAYMENT_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:8090/pservice';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const res = await fetch(`${PAYMENT_URL}/api/v1/auth/try-on/credits`, {
      headers: { Authorization: auth },
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 });
  }
}