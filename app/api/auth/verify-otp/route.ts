import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  'https://58bb-82-36-98-104.ngrok-free.app/bookingservice/api/v1/auth/users/verify-otp';

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!auth) {
    return NextResponse.json(
      { message: 'Missing Authorization header' },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'KrownBraids-Frontend/1.0',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('verify-otp upstream fetch failed:', err);
    return NextResponse.json(
      { message: 'Could not reach the verification service. Please try again.' },
      { status: 502 }
    );
  }

  const text = await res.text();
  const contentType = res.headers.get('content-type') ?? '';

  // ── THE GUARD ──
  // If ngrok (or anything else) returns an HTML page, reject it with a
  // clean JSON error instead of forwarding the 200 status to the client.
  if (
    contentType.includes('text/html') ||
    text.trimStart().startsWith('<!DOCTYPE')
  ) {
    console.error('verify-otp upstream returned HTML (ngrok abuse page?)');
    return NextResponse.json(
      {
        message:
          'The verification service is not reachable right now. Please try again in a moment.',
      },
      { status: 503 }
    );
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = { message: text || 'Unexpected response from verification service' };
  }

  return NextResponse.json(data, { status: res.status });
}