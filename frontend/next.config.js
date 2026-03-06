/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA configuration will be added later
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.onrender.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
}

module.exports = nextConfig

