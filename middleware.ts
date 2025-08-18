import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from 'jose'

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  
  const token = request.cookies.get('auth_token')?.value;
  return token || null;
}


function isAdmin(userRole: string): boolean {
  return userRole === 'admin';
}

function isVendor(userRole: string): boolean {
  return userRole === 'vendor';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log(`🔒 Middleware: Processing ${pathname}`)

  // Get token from request
  const token = getTokenFromRequest(request)
  console.log(`🔒 Middleware: Token found: ${!!token}`)

  // Verify token with jose (Edge Runtime compatible)
  let tokenResult;
  if (!token) {
    tokenResult = { success: false, error: 'No token provided' };
  } else {
    try {
      const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || '99b625d6684c52ae3f8631a5ae59428ecca84f3a38eeeb616a0e2817b2cff555');
      const { payload } = await jwtVerify(token, jwtSecret);
      
      const decoded = payload as unknown as JWTPayload;
      
      if (!decoded || !decoded.userId) {
        tokenResult = { success: false, error: 'Invalid token payload' };
      } else {
        tokenResult = { success: true, payload: decoded };
      }
    } catch (error) {
      tokenResult = { success: false, error: `JWT verification failed: ${error}` };
    }
  }
  
  if (!tokenResult.success) {
    console.log(`🔒 Middleware: Token verification failed: ${tokenResult.error}`)
    // Redirect to login for protected routes
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'Unauthorized - Invalid or missing token' },
        { status: 401 }
      )
    }
    
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const { payload } = tokenResult
  if (!payload) {
    return NextResponse.json(
      { message: 'Unauthorized - Invalid token payload' },
      { status: 401 }
    )
  }
  
  console.log(`🔒 Middleware: Token verified successfully for user ${payload.userId} with role ${payload.role}`)

  // Role-based access control
  if (pathname.startsWith('/admin')) {
    if (!isAdmin(payload.role)) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { message: 'Forbidden - Admin access required' },
          { status: 403 }
        )
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  if (pathname.startsWith('/vendor')) {
    if (!isVendor(payload.role) && !isAdmin(payload.role)) {
      if (pathname.startsWith('/api/vendor')) {
        return NextResponse.json(
          { message: 'Forbidden - Vendor access required' },
          { status: 403 }
        )
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Add user info to headers for API routes
  if (pathname.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-role', payload.role)
    requestHeaders.set('x-user-email', payload.email)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/vendor/:path*",
    "/admin/:path*",
    "/orders/:path*",
    "/messages/:path*",
    "/api/admin/:path*",
    "/api/vendor/:path*",
    "/api/orders/:path*",
    "/api/profile/:path*",
  ],
}
