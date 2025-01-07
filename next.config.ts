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
      {
        protocol: 'https',
        hostname: 'media2.giphy.com',
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
      source: '/notions',
      destination: 'https://notions.michaeldemar.co',
      permanent: true,
    },
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
    {
      source: '/quotes',
      destination: 'https://notions.michaeldemar.co/quotes',
      permanent: true,
    },
    {
      source: '/inspirations',
      destination: 'https://notions.michaeldemar.co/inspirations',
      permanent: true,
    },
    {
      source: '/til',
      destination: 'https://notions.michaeldemar.co/til',
      permanent: true,
    },
  ],
}

export default nextConfig
