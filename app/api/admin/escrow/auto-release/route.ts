import { NextRequest, NextResponse } from "next/server";
import * as orderService from "@/services/order_service";
import * as userService from "@/services/auth_service";
import { connectDB } from "@/lib/db";

async function getAdminFromToken(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  
  const isValid = await userService.isTokenValid(token);
  if (!isValid.success || !isValid.user || isValid.user?.role !== 'admin') return null;
  
  return isValid.user;
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();

    const result = await orderService.processAutoReleaseEscrows();

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 400 }
      );
    }

    const successfulReleases = result.data.filter((item: any) => item.success).length;
    const failedReleases = result.data.filter((item: any) => !item.success).length;

    return NextResponse.json({
      message: `Auto-release processing completed. ${successfulReleases} escrows released, ${failedReleases} failed.`,
      data: {
        totalProcessed: result.data.length,
        successfulReleases,
        failedReleases,
        details: result.data
      }
    });
  } catch (error) {
    console.error("Error processing auto-release escrows:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
