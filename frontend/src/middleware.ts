import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Since authentication is handled via Zustand's localStorage persistence,
  // we cannot easily read the auth token here in the Edge runtime.
  // The actual protection and redirect logic is handled client-side in the
  // respective dashboard layouts (admin/layout.tsx, customer/layout.tsx, etc.)
  // to prevent UI flashes.
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/seller/:path*', '/customer/:path*'],
};
