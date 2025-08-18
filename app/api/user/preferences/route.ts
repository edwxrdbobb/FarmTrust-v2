import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserById, updateUser } from "@/repositories/user_repo";

interface UserPreferences {
  notifications: {
    orderUpdates: boolean;
    promotions: boolean;
    farmerUpdates: boolean;
    smsNotifications: boolean;
  };
  language: string;
  region: string;
  currency: string;
  privacy: {
    profileVisibility: boolean;
    dataCollection: boolean;
    thirdPartyMarketing: boolean;
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
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

    // Get user preferences or return defaults
    const preferences: UserPreferences = user.preferences || {
      notifications: {
        orderUpdates: true,
        promotions: true,
        farmerUpdates: false,
        smsNotifications: true,
      },
      language: "en",
      region: "western",
      currency: "leone",
      privacy: {
        profileVisibility: true,
        dataCollection: true,
        thirdPartyMarketing: false,
      },
    };

    return NextResponse.json({ preferences }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching user preferences:", error);
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
    const { userId, preferences } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!preferences) {
      return NextResponse.json(
        { error: "Preferences data is required" },
        { status: 400 }
      );
    }

    const updatedUser = await updateUser(userId, { preferences });
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: "Preferences updated successfully",
        preferences: updatedUser.preferences 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
