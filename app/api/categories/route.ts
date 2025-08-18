import { NextRequest, NextResponse } from "next/server";
import * as categoryService from "@/services/category_service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const parentId = searchParams.get("parentId");
    
    // Get categories from database using service
    const result = await categoryService.getAllCategories(includeInactive, parentId);
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      message: "Categories fetched successfully",
      categories: result.data,
    });
  } catch (error) {
    console.error("Categories API Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch categories", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}