import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // Production optimization settings
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
    serverMinification: true,
    webpackBuildWorker: true,
    // Use Turbopack for development
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Bundle analyzer
  env: {
    ANALYZE: process.env.ANALYZE,
  },
  
  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },
  
  // Headers for security and performance
  async headers() {
    const headers = [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      // Cache static assets
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Cache images
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control', 
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
    
    // Add CSP only in production
    if (process.env.NODE_ENV === 'production') {
      headers[0].headers.push({
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.sentry-cdn.com",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data:",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://o4507609881264128.ingest.de.sentry.io",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'"
        ].join('; ')
      });
    }
    
    return headers;
  },
  
  // Webpack configuration for bundle optimization
  webpack: (config, { dev, isServer, webpack }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        // Split chunks for better caching
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true
            },
            vendor: {
              test: /[\/]node_modules[\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all'
            },
            // Separate chunks for large libraries
            react: {
              test: /[\/]node_modules[\/](react|react-dom)[\/]/,
              name: 'react',
              chunks: 'all',
              priority: 20
            },
            supabase: {
              test: /[\/]node_modules[\/]@supabase[\/]/,
              name: 'supabase',
              chunks: 'all',
              priority: 15
            },
            ui: {
              test: /[\/]node_modules[\/](@radix-ui|lucide-react)[\/]/,
              name: 'ui',
              chunks: 'all',
              priority: 10
            }
          }
        }
      };
    }
    
    // Bundle analyzer
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? '../bundle-analyzer/server.html' : './bundle-analyzer/client.html',
          openAnalyzer: false
        })
      );
    }
    
    // Source maps in production for error tracking
    if (!dev) {
      config.devtool = 'hidden-source-map';
    }
    
    return config;
  },
  
  // Generate static pages for better performance
  output: 'standalone',
  
  // Logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development'
    }
  }
};

let configWithPlugins = withNextIntl(nextConfig);

// Add Sentry in production
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  configWithPlugins = withSentryConfig(configWithPlugins, {
    silent: true,
    hideSourceMaps: true,
    disableLogger: true,
  });
}

export default configWithPlugins;
