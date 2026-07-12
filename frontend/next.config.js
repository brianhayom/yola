/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const isStaticExport = process.env.NEXT_OUTPUT === 'export';

const nextConfig = {
  ...(isStaticExport && { output: 'export' }),
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'images.unsplash.com', 'source.unsplash.com'],
    ...(isStaticExport && { unoptimized: true }),
  },
  async rewrites() {
    if (isStaticExport) return [];
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://51.79.150.44:4000/api'}/:path*`,
      },
    ];
  },
};

module.exports = withPWA(nextConfig);