import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'schoolify.top',
    '*.schoolify.top',
    '*.trycloudflare.com',
    'localhost:3050',
    'localhost:3000',
  ],
};

export default nextConfig;
