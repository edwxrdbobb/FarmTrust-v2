import { NextRequest, NextResponse } from "next/server"
import * as userService from "@/services/auth_service"
import * as userRepo from "@/repositories/user_repo"
import { connectDB } from "@/lib/db"

async function getAdminFromToken(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value
  if (!token) return null
  
  const isValid = await userService.isTokenValid(token)
  if (!isValid.success || !isValid.user || isValid.user?.role !== 'admin') return null
  
  return isValid.user
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await getAdminFromToken(request)
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    await connectDB()
    const { userId } = await params
    const user = await userRepo.getUserById(userId)
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    const userData = {
      id: user._id,
      name: user.name || 'Unknown User',
      email: user.email,
      role: user.role || 'buyer',
      status: user.isActive === false ? 'inactive' : user.status || 'active',
      joinDate: user.createdAt,
      avatar: user.image,
      phone: user.phone,
      verified: user.verified,
      department: user.department
    }

    return NextResponse.json({
      message: "User details fetched successfully",
      user: userData
    })
  } catch (error) {
    console.error("Error fetching user details:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await getAdminFromToken(request)
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    await connectDB()
    const { userId } = await params
    const updateData = await request.json()
    
    const updatedUser = await userRepo.updateUser(userId, updateData)
    
    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    // Type assertion to ensure we have a single user object
    const user = updatedUser as any

    const userData = {
      id: user._id,
      name: user.name || 'Unknown User',
      email: user.email,
      role: user.role || 'buyer',
      status: user.isActive === false ? 'inactive' : user.status || 'active',
      joinDate: user.createdAt,
      avatar: user.image,
      phone: user.phone,
      verified: user.verified,
      department: user.department
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: userData
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const { userId } = await params;

    if (!adminId) {
      return NextResponse.json(
        { message: "Admin ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Validate admin
    const admin = await userRepo.getUserById(adminId);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Check if user exists
    const existingUser = await userRepo.getUserById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Prevent admins from deleting themselves
    if (userId === adminId) {
      return NextResponse.json(
        { message: "Cannot delete your own admin account" },
        { status: 400 }
      );
    }

    // Soft delete by setting deleted_at timestamp
    const deletedUser = await userRepo.updateUser(userId, {
      deleted_at: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({
      message: "User deleted successfully",
      data: deletedUser || { success: true }
    });
  } catch (error) {
    console.error("Admin User Delete API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}