// // app/api/auth/bookings/with-images/route.ts
// import { NextRequest, NextResponse } from 'next/server';

// const BACKEND_URL =
//   process.env.BOOKING_SERVICE_URL ||
//   'https://60a6-82-36-98-104.ngrok-free.app/bservice';

// export async function POST(req: NextRequest) {
//   try {
//     const auth = req.headers.get('authorization') ?? '';
//     const contentType = req.headers.get('content-type') ?? '';

//     // Read the raw body — do NOT call req.formData() as that would
//     // re-serialize and corrupt the multipart boundaries
//     const body = await req.arrayBuffer();

//     const upstream = await fetch(
//       `${BACKEND_URL}/api/v1/auth/bookings/with-images`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': contentType,
//           'ngrok-skip-browser-warning': 'true',
//           ...(auth ? { Authorization: auth } : {}),
//         },
//         body,
//         cache: 'no-store',
//       }
//     );

//     const respContentType = upstream.headers.get('content-type') ?? '';
//     const data = respContentType.includes('application/json')
//       ? await upstream.json()
//       : { message: await upstream.text() };

//     return NextResponse.json(data, { status: upstream.status });
//   } catch (err) {
//     console.error('[bookings/with-images POST] error:', err);
//     return NextResponse.json(
//       { message: err instanceof Error ? err.message : 'Proxy failed' },
//       { status: 502 }
//     );
//   }
// }


// app/api/auth/bookings/with-images/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BOOKING_SERVICE_URL ||
  'https://60a6-82-36-98-104.ngrok-free.app/bookingservice';

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? '';
    const contentType = req.headers.get('content-type') ?? '';

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { message: 'Expected multipart/form-data' },
        { status: 400 }
      );
    }

    // Read the raw body — do NOT call req.formData() as that would
    // re-serialize and corrupt the multipart boundaries.
    const body = await req.arrayBuffer();

    const upstream = await fetch(
      `${BACKEND_URL}/api/v1/auth/bookings/with-images`,
      {
        method: 'POST',
        headers: {
          'Content-Type': contentType,   // preserve boundary
          'ngrok-skip-browser-warning': 'true',
          ...(auth ? { Authorization: auth } : {}),
        },
        body,
        cache: 'no-store',
      }
    );

    const respContentType = upstream.headers.get('content-type') ?? '';
    const data = respContentType.includes('application/json')
      ? await upstream.json()
      : { message: await upstream.text() };

    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.error('[bookings/with-images POST] error:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Proxy failed' },
      { status: 502 }
    );
  }
}