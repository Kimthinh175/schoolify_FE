import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '*.trycloudflare.com',
    'localhost:3050',
    'localhost:3000',
  ],
};

export default nextConfig;
