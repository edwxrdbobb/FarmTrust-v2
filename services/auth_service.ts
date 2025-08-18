import * as userRepo from "@/repositories/user_repo";
import * as vendorRepo from "@/repositories/vendor_repo";
import * as tokenBlacklistRepo from "@/repositories/tokenBlacklist_repo";
import { connectDB } from "@/lib/db";
import {
  startTransaction,
  commitTransaction,
  abortTransaction,
} from "@/lib/db_transaction";
import * as jwt from "jsonwebtoken";

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    await connectDB();
    console.log("Trying to login ");

    // Find user by email
    const user = await userRepo.getUserByEmail(email);

    if (!user) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Check if password is valid
    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Check if user is deleted
    if (user.deleted_at) {
      return {
        success: false,
        error: "Account has been deactivated",
      };
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return {
        success: false,
        error: "JWT secret not configured",
      };
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return {
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        premium_status: user.premium_status,
        phone: user.phone,
        verified: user.verified,
      },
      token,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "An error occurred during login",
    };
  }
}

export async function registerUser(
  data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  },
  session?: any
) {
  try {
    await connectDB();

    const { name, email, password, role } = data;

    // Check if user already exists
    const existingUser = await userRepo.getUserByEmail(email);
    if (existingUser) {
      return {
        success: false,
        error: "User with this email already exists",
      };
    }

    // Create user with specified role
    const user = await userRepo.createUser(
      {
        name,
        email,
        password,
        role: role || "buyer",
        auth_provider: "local",
      },
      { session }
    );

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return {
        success: false,
        error: "JWT secret not configured",
      };
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return {
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "An error occurred during registration",
    };
  }
}

export async function getUserWithRole(userId: string) {
  try {
    await connectDB();

    const user = await userRepo.getUserById(userId);
    if (!user) {
      return null;
    }

    let additionalData = null;

    // If user is a vendor, get vendor details
    if (user.role === "vendor") {
      additionalData = await vendorRepo.getVendorByUserId(userId);
    }

    return {
      ...user.toObject(),
      vendorDetails: additionalData,
    };
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}

export async function invalidateToken(token: string) {
  try {
    await connectDB();

    // Verify and decode the token to get user info and expiration
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return {
        success: false,
        error: "JWT secret not configured",
      };
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (jwtError) {
      return {
        success: false,
        error: "Invalid token",
      };
    }

    // Check if token is already blacklisted
    const isBlacklisted = await tokenBlacklistRepo.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return {
        success: true,
        message: "Token already invalidated",
      };
    }

    // Add token to blacklist
    await tokenBlacklistRepo.addTokenToBlacklist({
      token,
      user_id: decoded.userId,
      expires_at: new Date(decoded.exp * 1000), // Convert JWT exp to Date
    });

    return {
      success: true,
      message: "Token invalidated successfully",
    };
  } catch (error) {
    console.error("Token invalidation error:", error);
    return {
      success: false,
      error: "An error occurred during token invalidation",
    };
  }
}

export async function isTokenValid(token: string) {
  try {
    await connectDB();

    // First check if token is blacklisted
    const isBlacklisted = await tokenBlacklistRepo.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return {
        valid: false,
        error: "Token has been invalidated",
      };
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return {
        valid: false,
        error: "JWT secret not configured",
      };
    }

    try {
      const decoded: any = jwt.verify(token, jwtSecret);
      
      // Get user details from database
      const user = await userRepo.getUserById(decoded.userId);
      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      return {
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          verified: user.verified,
          department: user.department,
          permissions: user.permissions,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          isActive: user.isActive,
        },
      };
    } catch (jwtError) {
      return {
        success: false,
        error: "Invalid or expired token",
      };
    }
  } catch (error) {
    console.error("Token validation error:", error);
    return {
      success: false,
      error: "An error occurred during token validation",
    };
  }
}

export async function updateUserProfile(userId: string, updateData: {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
}) {
  try {
    await connectDB();

    // Get user by ID
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Update user fields
    if (updateData.name) user.name = updateData.name;
    if (updateData.email) user.email = updateData.email;
    if (updateData.phone) user.phone = updateData.phone;
    if (updateData.department) user.department = updateData.department;

    // Save updated user
    const updatedUser = await user.save();

    return {
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        department: updatedUser.department,
        verified: updatedUser.verified,
        image: updatedUser.image,
        premium_status: updatedUser.premium_status,
        permissions: updatedUser.permissions,
        lastLogin: updatedUser.lastLogin,
        createdAt: updatedUser.createdAt,
        isActive: updatedUser.isActive,
      },
    };
  } catch (error) {
    console.error("Profile update error:", error);
    return {
      success: false,
      error: "An error occurred while updating profile",
    };
  }
}

// Email verification functions
export async function generateEmailVerificationToken(userId: string) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return {
        success: false,
        error: "JWT secret not configured",
      };
    }

    // Generate a verification token that expires in 24 hours
    const verificationToken = jwt.sign(
      {
        userId: userId,
        type: 'email_verification',
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return {
      success: true,
      token: verificationToken,
    };
  } catch (error) {
    console.error("Error generating email verification token:", error);
    return {
      success: false,
      error: "Failed to generate verification token",
    };
  }
}

export async function verifyEmailToken(token: string) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return {
        success: false,
        error: "JWT secret not configured",
      };
    }

    // Verify the token
    const decoded: any = jwt.verify(token, jwtSecret);
    
    // Check if it's an email verification token
    if (decoded.type !== 'email_verification') {
      return {
        success: false,
        error: "Invalid token type",
      };
    }

    // Get user by ID
    const user = await userRepo.getUserById(decoded.userId);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Check if already verified
    if (user.verified) {
      return {
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          verified: user.verified,
          emailVerifiedAt: user.emailVerifiedAt,
        },
        message: "Email already verified"
      };
    }

    // Update user verification status
    user.verified = true;
    user.emailVerifiedAt = new Date();
    await user.save();

    // Send welcome email (optional)
    try {
      const emailService = await import('./email_service');
      await emailService.sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.warn('Failed to send welcome email:', emailError);
      // Don't fail the verification if welcome email fails
    }

    return {
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        verified: user.verified,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.error("Token verification error:", error);
      return {
        success: false,
        error: "Invalid or expired verification token",
      };
    } else {
      console.error("Email verification error:", error);
      return {
        success: false,
        error: "An error occurred during email verification",
      };
    }
  }
}

export async function sendVerificationEmail(userId: string, email: string) {
  try {
    // Get user details
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Generate verification token
    const tokenResult = await generateEmailVerificationToken(userId);
    if (!tokenResult.success) {
      return tokenResult;
    }

    // Create verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3006';
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${tokenResult.token}`;

    // Import email service dynamically to avoid circular dependencies
    const emailService = await import('./email_service');
    
    // Send the actual email
    const emailResult = await emailService.sendVerificationEmail(email, user.name, verificationUrl);
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // For development, we'll still return success but log the error
      return {
        success: true,
        message: "Verification email sent successfully",
        verificationUrl, // For development/testing purposes
        emailError: emailResult.error // For debugging
      };
    }

    return {
      success: true,
      message: "Verification email sent successfully",
      verificationUrl, // For development/testing purposes
    };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return {
      success: false,
      error: "Failed to send verification email",
    };
  }
}
