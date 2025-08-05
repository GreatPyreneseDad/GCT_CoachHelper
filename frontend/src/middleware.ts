import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Redirect to appropriate dashboard based on role
    if (path === '/') {
      if (token?.role === 'coach') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      } else if (token?.role === 'client') {
        return NextResponse.redirect(new URL('/portal', req.url));
      }
    }

    // Protect coach routes
    if (path.startsWith('/dashboard') || 
        path.startsWith('/clients') || 
        path.startsWith('/branding') ||
        path.startsWith('/profile') ||
        path.startsWith('/analytics') ||
        path.startsWith('/store')) {
      if (token?.role !== 'coach') {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }

    // Protect client routes
    if (path.startsWith('/portal')) {
      if (token?.role !== 'client') {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/clients/:path*',
    '/branding/:path*',
    '/profile/:path*',
    '/analytics/:path*',
    '/store/:path*',
    '/portal/:path*',
    '/calendar/:path*',
    '/settings/:path*',
  ],
};