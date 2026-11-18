import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: 'security',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.conmeet.moe',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/featured',
        destination: '/conventions/featured',
        permanent: false,
      },
      {
        source: '/featured-cons',
        destination: '/conventions/featured',
        permanent: false,
      },
      {
        source: '/conventions/:slug/meetups/:id/collections',
        destination: '/conventions/:slug/meetups/:id/gallery',
        permanent: true,
      },
      {
        source: '/conventions/:slug/meetups/:id/collections/:path*',
        destination: '/conventions/:slug/meetups/:id/gallery/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
