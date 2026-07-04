import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    }, 
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {remotePatterns: [
    { protocol: 'https', hostname: 'covers.openlibrary.org'},
     { protocol: 'https', hostname: 'cuwoxgk3l4u8q793.public.blob.vercel-storage.com'},
  ]}
};

export default nextConfig;
