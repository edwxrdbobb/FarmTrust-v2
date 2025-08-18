import { NextRequest, NextResponse } from "next/server";
import * as userRepo from "@/repositories/user_repo";
import { connectDB } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const { userId } = params;
    const { reason } = await request.json();

    if (!adminId) {
      return NextResponse.json(
        { message: "Admin ID is required" },
        { status: 400 }
      );
    }

    if (!reason) {
      return NextResponse.json(
        { message: "Ban reason is required" },
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
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Prevent admins from banning themselves
    if (userId === adminId) {
      return NextResponse.json(
        { message: "Cannot ban your own admin account" },
        { status: 400 }
      );
    }

    // Prevent banning other admins
    if (user.role === 'admin') {
      return NextResponse.json(
        { message: "Cannot ban other admin accounts" },
        { status: 400 }
      );
    }

    // Ban user
    const bannedUser = await userRepo.updateUser(userId, {
      status: 'banned',
      bannedAt: new Date(),
      bannedBy: adminId,
      banReason: reason,
      updatedAt: new Date()
    });

    return NextResponse.json({
      message: "User banned successfully",
      data: bannedUser
    });
  } catch (error) {
    console.error("Admin User Ban API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const { userId } = params;

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
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Unban user
    const unbannedUser = await userRepo.updateUser(userId, {
      status: 'active',
      bannedAt: null,
      bannedBy: null,
      banReason: null,
      updatedAt: new Date()
    });

    return NextResponse.json({
      message: "User unbanned successfully",
      data: unbannedUser
    });
  } catch (error) {
    console.error("Admin User Unban API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}