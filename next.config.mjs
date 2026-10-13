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
};

export default nextConfig;
