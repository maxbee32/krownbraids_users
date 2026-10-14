import { NextRequest, NextResponse } from 'next/server';

const BASE =
  'https://58bb-82-36-98-104.ngrok-free.app';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ salonId: string }> }
) {
  const { salonId } = await params;
  const BACKEND_URL = `${BASE}/servicesservice/api/v1/auth/services/public/salon/${salonId}`;

  try {
    console.log('=== Fetch Services For Salon ===');
    console.log('Backend URL:', BACKEND_URL);

    const auth = request.headers.get('authorization');

    const response = await fetch(BACKEND_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(auth ? { Authorization: auth } : {}),
        'ngrok-skip-browser-warning': 'true',
      },
      cache: 'no-store',
    });

    console.log('Backend response status:', response.status);

    const rawResponse = await response.text();

    console.log('Backend raw response:', rawResponse);

    let data: any;

    try {
      data = JSON.parse(rawResponse);
    } catch {
      data = { message: rawResponse };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            data?.message ||
            data?.error ||
            'Failed to fetch services',
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Services proxy error:', error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}