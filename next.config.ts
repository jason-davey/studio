
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {

    ignoreBuildErrors: true,
  },
  allowedDevOrigins: [
 '9000-firebase-studio-1747287487844.cluster-nzwlpk54dvagsxetkvxzbvslyi.cloudworkstations.dev',
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.realinsurance.com.au',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Added this entry
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
