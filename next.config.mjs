/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static-cdn.jtvnw.net",
      },
      {
        protocol: "https",
        hostname: "static.twitchcdn.net",
      },
    ],
    unoptimized: true,
  },
  output: "standalone",
};

export default nextConfig;
