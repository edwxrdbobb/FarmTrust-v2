import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserById, updateUser } from "@/repositories/user_repo";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // In a real app, you would get the user ID from session/auth
    // For now, we'll use a query parameter or mock it
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Remove sensitive information
    const { password, emailVerificationToken, ...userProfile } = user.toObject();

    return NextResponse.json({ user: userProfile }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { userId, name, email, phone, address, profileImage } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const updateData = {
      name,
      email,
      phone,
      address,
      profileImage,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const updatedUser = await updateUser(userId, updateData);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Remove sensitive information
    const { password, emailVerificationToken, ...userProfile } = updatedUser.toObject();

    return NextResponse.json(
      { 
        message: "Profile updated successfully",
        user: userProfile 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
