import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: [
    'schoolify.top',
    '*.schoolify.top',
    '*.trycloudflare.com',
    'localhost:3051',
    'localhost:3050',
    'localhost:3000',
  ],

};

export default nextConfig;
