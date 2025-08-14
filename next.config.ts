import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Output configuration for Docker
  output: 'standalone',
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },

  // Redirect configuration
  async redirects() {
    return [
      {
        source: '/health',
        destination: '/api/health',
        permanent: false,
      },
      {
        source: '/metrics',
        destination: '/api/metrics',
        permanent: false,
      },
    ];
  },

  // Environment-specific settings
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },

  // Experimental features for production optimization
  experimental: {
    // Enable when stable
    // optimizePackageImports: ['@radix-ui/react-icons'],
  },

  // Image optimization
  images: {
    domains: [],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Webpack configuration for production optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Production-specific optimizations
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },
};

export default withNextIntl(nextConfig);
