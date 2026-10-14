import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  'https://58bb-82-36-98-104.ngrok-free.app/bookingservice/api/v1/auth/users/register';

export async function POST(request: NextRequest) {
  // Parse the incoming body once, up front
  let body: Record<string, string | undefined>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const { firstName, lastName, email, phoneNumber, password } = body;

  if (!firstName || !lastName || !email || !phoneNumber || !password) {
    return NextResponse.json(
      {
        message:
          'Missing required fields: firstName, lastName, email, phoneNumber, password',
      },
      { status: 400 }
    );
  }

  // Call the backend
  let res: Response;
  try {
    res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'KrownBraids-Frontend/1.0',
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
      }),
    });
  } catch (err) {
    console.error('register upstream fetch failed:', err);
    return NextResponse.json(
      { message: 'Could not reach the registration service. Please try again.' },
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
    console.error('register upstream returned HTML (ngrok abuse page?)');
    return NextResponse.json(
      {
        message:
          'The registration service is not reachable right now. Please try again in a moment.',
      },
      { status: 503 }
    );
  }

  // Parse JSON safely
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    data = { message: raw || 'Registration failed' };
  }

  return NextResponse.json(data, { status: res.status });
}