import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and specific API routes
  if (
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/favicon') ||
    request.nextUrl.pathname.startsWith('/images/') ||
    (request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.includes('/api/health'))
  ) {
    return NextResponse.next();
  }
  
  try {
    // Add security and performance headers
    const response = NextResponse.next();
    
    // Security headers (backup to next.config.ts)
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    
    // Rate limiting for health checks
    if (request.nextUrl.pathname === '/api/health') {
      const ip = request.ip ?? request.headers.get('X-Forwarded-For') ?? '127.0.0.1';
      // Basic rate limiting could be implemented here
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    
    // Handle internationalization first
    const intlResponse = intlMiddleware(request);
    
    // If intl middleware wants to redirect, copy our headers and return
    if (intlResponse instanceof Response) {
      for (const [key, value] of response.headers.entries()) {
        if (key.startsWith('x-') || key === 'referrer-policy' || key === 'cache-control') {
          intlResponse.headers.set(key, value);
        }
      }
      return intlResponse;
    }
    
    // Continue with Supabase auth middleware
    const finalResponse = await updateSession(intlResponse || response);
    
    // Ensure our security headers are preserved
    for (const [key, value] of response.headers.entries()) {
      if (key.startsWith('x-') || key === 'referrer-policy' || key === 'cache-control') {
        finalResponse.headers.set(key, value);
      }
    }
    
    return finalResponse;
    
  } catch (error) {
    console.error('Middleware error:', error);
    
    // Fallback: just apply internationalization
    return intlMiddleware(request);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
