import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
  },
  headers: async () => [
    {
      source: '/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
  redirects: async () => [
    {
      source: '/bookmarks',
      destination: 'https://notions.michaeldemar.co/bookmarks',
      permanent: true,
    },
    {
      source: '/wikipedia',
      destination: 'https://notions.michaeldemar.co/wikipedia',
      permanent: true,
    },
    {
      source: '/uses',
      destination: 'https://notions.michaeldemar.co/uses',
      permanent: true,
    },
  ],
}

export default nextConfig
