import { NextResponse } from 'next/server';

const BACKEND_URL =
  'https://58bb-82-36-98-104.ngrok-free.app/bservice/api/v1/auth/business/salons/get-all-salons';

export async function GET() {
  try {
    console.log('=== Fetch All Salons ===');
    console.log('Backend URL:', BACKEND_URL);

    const response = await fetch(BACKEND_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
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
            'Failed to fetch salons',
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Salons proxy error:', error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}