/** @type {import('next').NextConfig} */
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static-cdn.jtvnw.net"
      },
      {
        protocol: "https",
        hostname: "static.twitchcdn.net"
      }
    ]
  }
};

if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}


export default nextConfig;
