import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    serverBaseUrl: 'http://localhost:5000',
    serverPort: '5000',
  },
  reactStrictMode: false,
};

export default nextConfig;
