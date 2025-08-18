# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application  
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linter

## Project Architecture

FarmTrust is a Next.js 15 multivendor farmer's marketplace following the Repository-Service pattern with these key layers:

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components**: Radix UI primitives with shadcn/ui components  
- **Backend**: Node.js, MongoDB with Mongoose ODM
- **Authentication**: Passport.js with JWT tokens, bcrypt for password hashing
- **State Management**: React Context (AuthContext, CartContext)
- **Development**: Turbopack for fast development builds

### Directory Structure
- `/app` - Next.js App Router pages with role-based organization (admin, vendor, buyer, auth)
- `/lib` - Utility functions, database connections, configurations
- `/models` - Mongoose schema definitions with snake_case naming
- `/repositories` - Data access layer handling MongoDB operations
- `/services` - Business logic layer with database connection management
- `/components` - Reusable React components organized by domain (admin, auth, buyer, vendor, ui, common)
- `/context` - React Context providers for global state management
- `/hooks` - Custom React hooks
- `/types` - TypeScript type definitions
- `/public` - Static assets

### Repository-Service Pattern
1. **Models** - Define data schemas using Mongoose (snake_case files: `user_model.ts`)
2. **Repositories** - Handle database operations (snake_case files: `user_repo.ts`)
3. **Services** - Implement business logic and database connections (snake_case files: `auth_service.ts`)
4. **API Routes** - Handle HTTP requests/responses (keep thin)
5. **Components** - UI presentation layer

## Critical Patterns

### Database Operations
- **IMPORTANT**: All `connectDB()` calls must be implemented in service files, never in route files
- All business logic must be contained within service files
- Route files should remain thin and only handle HTTP request/response logic
- Always use transactions for multi-document operations:

```typescript
let session;
try {
  await connectDB();
  session = await startTransaction();
  // operations
  await commitTransaction(session);
} catch (error) {
  if (session) await abortTransaction(session);
  // error handling
}
```

### API Route Pattern (Thin Controller)
```typescript
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.email || !data.password) {
      return NextResponse.json(
        { message: "Required fields missing" },
        { status: 400 }
      );
    }
    
    // Delegate to service layer (NO connectDB() here)
    const result = await authService.loginUser(data);
    
    if (!result.success) {
      return NextResponse.json({ message: result.error }, { status: 401 });
    }
    
    return NextResponse.json({
      message: "Success",
      user: result.user,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### File Naming Conventions
- Use snake_case for model files: `user_model.ts`, `farmer_request_model.ts`
- Use snake_case for repository files: `user_repo.ts`, `product_repo.ts`
- Use snake_case for service files: `auth_service.ts`, `order_service.ts`
- Use PascalCase for React components: `LoginPage.tsx`, `ProductCard.tsx`
- Use kebab-case for other files: `auth-provider.tsx`, `use-mobile.tsx`

### Import Organization
```typescript
// 1. External libraries
import React from "react";
import { NextRequest, NextResponse } from "next/server";

// 2. Internal utilities and configs
import { connectDB } from "@/lib/db";
import { startTransaction } from "@/lib/db_transaction";

// 3. Services and repositories
import * as authService from "@/services/auth_service";
import * as userRepo from "@/repositories/user_repo";

// 4. Models and types
import User from "@/models/user_model";

// 5. Components
import { Button } from "@/components/ui/button";
```

## Authentication System

Multi-provider authentication using Passport.js with JWT token management:
- Local authentication (email/password with bcrypt)
- Google OAuth 2.0
- Facebook OAuth  
- JWT tokens with blacklist validation for secure logout
- Role-based access control (admin, vendor, buyer/user)
- Token invalidation service for logout functionality

## Key Business Features

### Marketplace Domain
- **Multi-vendor platform** supporting organic farmers, fish farmers, cattle farmers, waste-to-resource farmers
- **Escrow system** for secure payments - funds held until delivery confirmation
- **Role-based access**: Admin (analytics, disputes, user management), Vendor (product management, order fulfillment), Buyer (browsing, cart, orders)
- **Dispute resolution** system with admin escalation
- **Review and rating** system for vendors and products
- **Farmer verification** process with document management

### Core Models
- User, Vendor, Product, Category, Order, Cart, Dispute, FarmerRequest
- Review, Notification, Address, PaymentMethod, Escrow, Conversation, Message
- Analytics for tracking platform metrics

## Environment Variables Required
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key for token signing
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Google OAuth
- `FACEBOOK_APP_ID` & `FACEBOOK_APP_SECRET` - Facebook OAuth

## Database Configuration
- MongoDB with Mongoose ODM
- Connection caching for serverless environments (`lib/db.ts`)
- Transaction support (`lib/db_transaction.ts`)
- Path mapping with `@/*` for root-level imports

## TypeScript Standards
- Use strict TypeScript configuration
- Define proper interfaces for all data structures
- Avoid `any` type - use proper typing
- Export types and interfaces for reusability
- Type definitions organized in `/types` directory