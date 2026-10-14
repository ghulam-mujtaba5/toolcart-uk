import fs from 'node:fs';

// Clean stale tsbuildinfo to prevent root file resolution mismatch on .next/types after cache resets
if (fs.existsSync('tsconfig.tsbuildinfo')) {
  try {
    fs.unlinkSync('tsconfig.tsbuildinfo');
  } catch {
    // Ignore cleanup errors
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/catalog',
        destination: '/search',
      },
      {
        source: '/categories',
        destination: '/',
      },
      {
        source: '/product/:slug',
        destination: '/products/:slug',
      },
      {
        source: '/guide/:slug*',
        destination: '/guides/:slug*',
      },
    ];
  },
};

export default nextConfig;
