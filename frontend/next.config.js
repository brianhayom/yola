/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'images.unsplash.com', 'source.unsplash.com'],
    unoptimized: true,
  },
};

module.exports = withPWA(nextConfig);