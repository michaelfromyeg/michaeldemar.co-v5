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
  },
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
