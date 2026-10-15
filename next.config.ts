import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   allowedDevOrigins: ['192.168.100.4'],
   devIndicators: false,
   images: {
      remotePatterns: [new URL('https://res.cloudinary.com/**')]
   }
};

export default nextConfig;
