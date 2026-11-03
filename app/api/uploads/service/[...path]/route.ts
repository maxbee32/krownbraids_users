// app/api/uploads/service/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Try candidate base URLs — whichever responds 200 wins.
// This handles the microservice architecture where services live
// on different mount points.
const CANDIDATES = [
  (filePath: string) =>
    `${process.env.SERVICES_SERVICE_URL ?? 'https://5f31-82-36-98-104.ngrok-free.app'}/api/v1/auth/images/services/${filePath}`,
  (filePath: string) =>
    `${process.env.BUSINESS_SERVICE_URL ?? 'https://5f31-82-36-98-104.ngrok-free.app/bservice'}/api/v1/auth/images/services/${filePath}`,
  (filePath: string) =>
    `${process.env.SERVICES_SERVICE_URL ?? 'https://5f31-82-36-98-104.ngrok-free.app'}/servicesservice/api/v1/auth/images/services/${filePath}`,
];

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const filePath = path.join('/');

    for (const buildUrl of CANDIDATES) {
      const url = buildUrl(filePath);
      console.log('[service-img-proxy] trying:', url);

      const upstream = await fetch(url, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
        cache: 'no-store',
      });

      if (upstream.ok) {
        const contentType =
          upstream.headers.get('content-type') || 'image/jpeg';
        const buffer = await upstream.arrayBuffer();
        console.log(
          '[service-img-proxy] ok:',
          upstream.status,
          `${buffer.byteLength} bytes`,
          contentType,
          '←',
          url
        );
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600, immutable',
          },
        });
      }

      console.warn('[service-img-proxy] failed:', upstream.status, url);
    }

    return new NextResponse(null, { status: 404 });
  } catch (error) {
    console.error('[service-img-proxy] error:', error);
    return new NextResponse(null, { status: 500 });
  }
}