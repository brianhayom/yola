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
};

module.exports = withPWA(nextConfig);