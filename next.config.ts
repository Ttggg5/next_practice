import type { NextConfig } from 'next';
import os from 'os';

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
    serverPort: '5000',
    serverBaseUrl: `http://${address}:5000`,
  },
};

export default nextConfig;
