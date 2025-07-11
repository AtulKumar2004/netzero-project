import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Define protected routes
const protectedRoutes = [
  '/portal/customer',
  '/portal/retailer',
  '/portal/ngo',
  '/api/items/submit',
  '/api/pickup/request',
  '/api/retailer',
  '/api/ngo'
];

// Define role-based routes
const roleRoutes = {
  '/portal/customer': ['customer'],
  '/portal/retailer': ['retailer'],
  '/portal/ngo': ['ngo'],
  '/api/retailer': ['retailer'],
  '/api/ngo': ['ngo']
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    // Redirect to login for protected routes
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify token
    const decoded = await verifyToken(token);
    
    if (!decoded) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    const requiredRoles = Object.entries(roleRoutes).find(([route]) => 
      pathname.startsWith(route)
    )?.[1];

    if (requiredRoles && !requiredRoles.includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);
    requestHeaders.set('x-user-email', decoded.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware error:', error);
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/portal/:path*',
    '/api/items/submit',
    '/api/pickup/:path*',
    '/api/retailer/:path*',
    '/api/ngo/:path*'
  ]
};