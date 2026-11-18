
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Login do Google pelo domínio da loja: repassa as páginas de login do Firebase
  // (ver authDomain em src/firebase/config.ts).
  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination: 'https://studio-6696860128-c7a6f.firebaseapp.com/__/auth/:path*',
      },
      {
        source: '/__/firebase/:path*',
        destination: 'https://studio-6696860128-c7a6f.firebaseapp.com/__/firebase/:path*',
      },
      {
        source: '/fotos/:path*',
        destination: 'https://pub-537c513e694c430d98df40c79ed7e7c6.r2.dev/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/fotos/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    deviceSizes: [320, 480, 640, 828, 1080, 1600],
    imageSizes: [320, 480],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-537c513e694c430d98df40c79ed7e7c6.r2.dev',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
