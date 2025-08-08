import { Analytics } from '@vercel/analytics/server';
import { SpeedInsights } from '@vercel/speed-insights/next';

export async function register() {
  // Only run in production
  if (process.env.NODE_ENV !== 'production') {
    return;
  }
  
  // Initialize performance monitoring
  console.log('🚀 Initializing production instrumentation...');
  
  // Performance monitoring
  if (process.env.VERCEL_ANALYTICS_ID) {
    console.log('📊 Vercel Analytics initialized');
  }
  
  // Error tracking
  if (process.env.SENTRY_DSN) {
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
      beforeSend(event) {
        // Filter out common errors
        if (event.exception) {
          const error = event.exception.values?.[0];
          if (error?.value?.includes('Non-Error promise rejection captured')) {
            return null;
          }
        }
        return event;
      },
    });
    console.log('🔍 Sentry error tracking initialized');
  }
  
  // Custom performance tracking
  if (typeof window === 'undefined') {
    // Server-side performance tracking
    const originalLog = console.log;
    console.log = (...args) => {
      const timestamp = new Date().toISOString();
      originalLog(`[${timestamp}]`, ...args);
    };
  }
  
  console.log('✅ Production instrumentation ready');
}