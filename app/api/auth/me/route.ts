// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.AUTH_SERVICE_URL ||
  'https://60a6-82-36-98-104.ngrok-free.app/bookingservice';

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? '';
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // ⚠️ Note the path: /users/me (matches your UserController's @RequestMapping)
    const upstream = await fetch(`${BACKEND_URL}/api/v1/auth/users/me`, {
      headers: {
        Authorization: auth,
        'ngrok-skip-browser-warning': 'true',
      },
      cache: 'no-store',
    });

    const contentType = upstream.headers.get('content-type') ?? '';
    const data = contentType.includes('application/json')
      ? await upstream.json()
      : { message: await upstream.text() };

    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Proxy failed' },
      { status: 502 }
    );
  }
}