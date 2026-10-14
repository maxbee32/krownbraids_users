import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  'https://58bb-82-36-98-104.ngrok-free.app/bookingservice/api/v1/auth/users/resend-otp';

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!auth) {
    return NextResponse.json(
      { message: 'Missing Authorization header' },
      { status: 401 }
    );
  }

  let res: Response;
  try {
    res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'KrownBraids-Frontend/1.0',
      },
    });
  } catch (err) {
    console.error('resend-otp upstream fetch failed:', err);
    return NextResponse.json(
      { message: 'Could not reach the verification service. Please try again.' },
      { status: 502 }
    );
  }

  const raw = await res.text();
  const contentType = res.headers.get('content-type') ?? '';

  // ── Guard: if ngrok (or anything) returns an HTML page, reject it.
  if (
    contentType.includes('text/html') ||
    raw.trimStart().startsWith('<!DOCTYPE')
  ) {
    console.error('resend-otp upstream returned HTML (ngrok abuse page?)');
    return NextResponse.json(
      {
        message:
          'The verification service is not reachable right now. Please try again in a moment.',
      },
      { status: 503 }
    );
  }

  // If the backend returned an empty body (204 No Content), pass that through.
  if (!raw || !raw.trim()) {
    return new NextResponse(null, { status: res.status });
  }

  // Parse JSON safely — the response could still be non-JSON
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    data = { message: raw };
  }

  return NextResponse.json(data, { status: res.status });
}