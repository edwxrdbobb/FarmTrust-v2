import { NextRequest, NextResponse } from "next/server";
import * as productService from "@/services/product_service";
import * as authService from "@/services/auth_service";
import * as vendorService from "@/services/vendor_service";
import { connectDB } from "@/lib/db";

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  
  const isValid = await authService.isTokenValid(token);
  if (!isValid.success) return null;
  
  return isValid.user;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await productService.getProductById(id);
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 404 }
      );
    }
    
    // Format the product data for the frontend
    const product = result.data;
    const formattedProduct = {
      id: product._id,
      name: product.name,
      description: product.description,
      longDescription: product.description, // You might want to add a separate longDescription field
      price: product.price,
      unit: product.unit,
      quantity: product.quantity,
      category: product.category,
      organic: product.organic,
      featured: product.featured,
      available: product.quantity > 0,
      images: product.images || [],
      vendor: {
        id: product.vendorId?._id,
        farmName: product.vendorId?.business_name || product.vendorId?.farmName || "Local Farm",
        location: product.location || product.vendorId?.location || "Sierra Leone",
        rating: 4.8, // You might want to calculate this from reviews
        verified: true, // You might want to add a verified field to vendor model
        totalSales: 1240, // You might want to calculate this from orders
      },
      nutritionalInfo: {
        calories: "160 kcal",
        carbs: "38g",
        protein: "1.4g",
        fat: "0.3g",
        fiber: "1.8g",
      },
      specifications: {
        origin: product.location || "Sierra Leone",
        cultivation: product.organic ? "Organic" : "Conventional",
        harvest: product.harvestDate ? `Harvested on ${new Date(product.harvestDate).toLocaleDateString()}` : "Fresh",
        storage: "Cool, dry place",
      },
      harvestDate: product.harvestDate,
      location: product.location,
      created_at: product.createdAt,
      updated_at: product.updatedAt,
    };
    
    return NextResponse.json({
      message: "Product retrieved successfully",
      product: formattedProduct,
    });
  } catch (error) {
    console.error("Get Product API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Check if user is a vendor
    if (user.role !== "vendor") {
      return NextResponse.json(
        { message: "Only vendors can update products" },
        { status: 403 }
      );
    }
    
    const { id } = await params;
    const updateData = await request.json();
    
    // Get vendor record for the user
    const vendorResult = await vendorService.getVendorByUserId(user.id);
    if (!vendorResult.success || !vendorResult.data) {
      return NextResponse.json(
        { message: "Vendor profile not found" },
        { status: 404 }
      );
    }
    
    
    // Delegate to service layer using vendor ID (convert ObjectId to string)
    const result = await productService.updateProduct(id, updateData, vendorResult.data._id.toString());
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      message: "Product updated successfully",
      product: result.data,
    });
  } catch (error) {
    console.error("Update Product API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Check if user is a vendor
    if (user.role !== "vendor") {
      return NextResponse.json(
        { message: "Only vendors can delete products" },
        { status: 403 }
      );
    }
    
    const { id } = await params;
    
    // Get vendor record for the user
    const vendorResult = await vendorService.getVendorByUserId(user.id);
    if (!vendorResult.success || !vendorResult.data) {
      return NextResponse.json(
        { message: "Vendor profile not found" },
        { status: 404 }
      );
    }
    
    // Delegate to service layer using vendor ID (convert ObjectId to string)
    const result = await productService.deleteProduct(id, vendorResult.data._id.toString());
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Product API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}