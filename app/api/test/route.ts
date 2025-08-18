import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "API is working correctly",
    timestamp: new Date().toISOString()
  });
}
