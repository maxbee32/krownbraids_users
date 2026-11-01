// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '1f9b-82-36-98-104.ngrok-free.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '7257-82-36-98-104.ngrok-free.app',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;