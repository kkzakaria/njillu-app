import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Handle API routes separately (no internationalization, just auth)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return await updateSession(request);
  }
  
  // Handle non-API routes with internationalization first
  const intlResponse = intlMiddleware(request);
  
  // If intl middleware returns a redirect, return it directly
  if (intlResponse instanceof Response) {
    return intlResponse;
  }
  
  // Otherwise, apply Supabase auth middleware
  return await updateSession(request);
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
