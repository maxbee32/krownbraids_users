import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BOOKING_SERVICE_URL ||
  'https://2c9e-82-36-98-104.ngrok-free.app/bookingservice';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bookingId: string; fileName: string }> }
) {
  const { bookingId, fileName } = await params;

  try {
    const upstream = await fetch(
      `${BACKEND_URL}/api/v1/auth/bookings/images/${bookingId}/${fileName}`,
      {
        headers: { 'ngrok-skip-browser-warning': 'true' },
        cache: 'no-store',
      }
    );

    if (!upstream.ok) return new NextResponse(null, { status: upstream.status });

    const bytes = await upstream.arrayBuffer();
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type':
          upstream.headers.get('content-type') ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}