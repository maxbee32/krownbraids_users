// app/api/auth/stripe/verify/[sessionId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.PAYMENT_SERVICE_URL ||
  'https://7257-82-36-98-104.ngrok-free.app/bservice';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const upstream = await fetch(
      `${BACKEND_URL}/api/v1/auth/stripe/verify/${sessionId}`,
      {
        headers: { 'ngrok-skip-browser-warning': 'true' },
        cache: 'no-store',
      }
    );

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Verify failed' },
      { status: 502 }
    );
  }
}