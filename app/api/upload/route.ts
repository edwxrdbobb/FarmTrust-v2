import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    console.log("Upload API: Starting file upload");
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      console.log("Upload API: No file found in request");
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }
    
    console.log("Upload API: File received:", {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file type - allow all image types including WebP
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      console.log("Upload API: Invalid file type:", file.type);
      return NextResponse.json(
        { message: `Only image files are allowed. Received: ${file.type}` },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      console.log("Upload API: File too large:", file.size);
      return NextResponse.json(
        { message: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate random string for filename
    const generateRandomString = (length: number) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    // Get file extension
    const fileExtension = file.name.split('.').pop();
    
    // Create unique filename with random string + farmtrust prefix
    const randomString = generateRandomString(8);
    const filename = `farmtrust-${randomString}.${fileExtension}`;
    
    // Save to public/uploads directory
    const uploadDir = join(process.cwd(), "public", "uploads");
    
    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      console.log("Creating uploads directory:", uploadDir);
      await mkdir(uploadDir, { recursive: true });
    }
    
    const filepath = join(uploadDir, filename);
    console.log("Saving file to:", filepath);
    
    await writeFile(filepath, buffer);
    
    // Return the URL
    const imageUrl = `/uploads/${filename}`;
    console.log("Upload API: File uploaded successfully:", imageUrl);
    
    return NextResponse.json({
      message: "File uploaded successfully",
      url: imageUrl,
    });
  } catch (error) {
    console.error("Upload API: Error occurred:", error);
    return NextResponse.json(
      { message: `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 