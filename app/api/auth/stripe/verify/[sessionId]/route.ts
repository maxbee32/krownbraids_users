// app/api/auth/stripe/verify/[sessionId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.PAYMENT_SERVICE_URL ||
  'https://9125-82-36-98-104.ngrok-free.app/pservice';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Next.js 15: params is a Promise
    const { sessionId } = await context.params;

    console.log('[stripe verify] sessionId:', sessionId);

    const upstream = await fetch(
      `${BACKEND_URL}/api/v1/auth/stripe/verify/${sessionId}`,
      {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        cache: 'no-store',
      }
    );

    console.log('[stripe verify] upstream status:', upstream.status);

    const contentType = upstream.headers.get('content-type') ?? '';
    const data = contentType.includes('application/json')
      ? await upstream.json()
      : { message: await upstream.text() };

    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.error('[stripe verify] error:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Verify failed' },
      { status: 502 }
    );
  }
}