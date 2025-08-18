import * as jwt from 'jsonwebtoken';
import * as userRepo from '@/repositories/user_repo';
import * as tokenBlacklistRepo from '@/repositories/tokenBlacklist_repo';
import { connectDB } from './db';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function verifyJWTToken(token: string): Promise<{ success: boolean; payload?: JWTPayload; error?: string }> {
  try {
    if (!token) {
      return { success: false, error: 'No token provided' };
    }

    // Remove 'Bearer ' prefix if present
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    if (!process.env.JWT_SECRET) {
      return { success: false, error: 'JWT secret not configured' };
    }

    // Verify JWT signature and decode
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET) as JWTPayload;

    if (!decoded || !decoded.userId) {
      return { success: false, error: 'Invalid token payload' };
    }

    await connectDB();

    // Check if token is blacklisted
    const isBlacklisted = await tokenBlacklistRepo.isTokenBlacklisted(cleanToken);
    if (isBlacklisted) {
      return { success: false, error: 'Token has been invalidated' };
    }

    // Verify user still exists and is active
    const user = await userRepo.getUserById(decoded.userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.deleted_at) {
      return { success: false, error: 'User account deactivated' };
    }

    if (user.status === 'banned') {
      return { success: false, error: 'User account banned' };
    }

    return { 
      success: true, 
      payload: {
        userId: decoded.userId,
        email: decoded.email,
        role: user.role, // Use current role from database
      }
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { success: false, error: 'Invalid token' };
    }
    if (error instanceof jwt.TokenExpiredError) {
      return { success: false, error: 'Token expired' };
    }
    console.error('JWT verification error:', error);
    return { success: false, error: 'Token verification failed' };
  }
}

export function getTokenFromHeaders(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  
  // Also check cookies as fallback
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(cookie => {
        const [key, value] = cookie.trim().split('=');
        return [key, value];
      })
    );
    return cookies.auth_token || null;
  }
  
  return null;
}

export function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

export function isAdmin(userRole: string): boolean {
  return userRole === 'admin';
}

export function isVendor(userRole: string): boolean {
  return userRole === 'vendor';
}

export function isBuyer(userRole: string): boolean {
  return userRole === 'user' || userRole === 'buyer';
}

// Alias functions for backward compatibility
export const verifyJWT = verifyJWTToken;
export const verifyToken = verifyJWTToken;