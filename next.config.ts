import type { NextConfig } from 'next';
import os from 'os';

let port = '5000';
let address = '';
const networkInterfaces = os.networkInterfaces();
for (const interfaceName in networkInterfaces) {
    const addresses = networkInterfaces[interfaceName];
    for (const addr of addresses as any) {
      if ((addr.family === 'IPv4') && !addr.internal) {
        address = addr.address;
      }
    }
  }

const nextConfig: NextConfig = {
  env: {
    serverPort: port,
    serverBaseUrl: `http://${address}:${port}`,
  },
  allowedDevOrigins: ['*'],

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: address,
        port: port,
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;