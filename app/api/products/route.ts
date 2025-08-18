import { NextRequest, NextResponse } from "next/server";
import * as productService from "@/services/product_service";
import * as authService from "@/services/auth_service";
import * as vendorService from "@/services/vendor_service";

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  
  const isValid = await authService.isTokenValid(token);
  if (!isValid.success) return null;
  
  return isValid.user;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const vendor = searchParams.get("vendor");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const organic = searchParams.get("organic");
    const featured = searchParams.get("featured");
    const sortBy = searchParams.get("sortBy");
    
    let result;
    
    if (vendor === "current") {
      // Get current vendor's products (authenticated user)
      const user = await getUserFromToken(request);
      if (!user || user.role !== "vendor") {
        return NextResponse.json(
          { message: "Authentication required" },
          { status: 401 }
        );
      }

      // Get vendor profile for the authenticated user
      const vendorResult = await vendorService.getVendorByUserId(user.id);
      if (!vendorResult.success) {
        return NextResponse.json(
          { 
            message: "Vendor profile not found",
            redirectTo: "/vendor/onboarding"
          },
          { status: 404 }
        );
      }

      result = await productService.getProductsByVendor(vendorResult.data._id, page, limit);
    } else {
      // Public product catalog for buyers
      const filters = {
        ...(category && { category }),
        ...(search && { search }),
        ...(minPrice && { minPrice: parseInt(minPrice) }),
        ...(maxPrice && { maxPrice: parseInt(maxPrice) }),
        ...(organic === "true" && { organic: true }),
        ...(featured === "true" && { featured: true }),
        ...(sortBy && { sortBy }),
        status: "active", // Only show active products to buyers
      };
      
      if (search) {
        result = await productService.searchProducts(search, filters, page, limit);
      } else if (category) {
        result = await productService.getProductsByCategory(category, page, limit);
      } else {
        result = await productService.getProductsWithFilters(filters, page, limit);
      }
    }
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 400 }
      );
    }
    
    // Debug: Log the raw result
    console.log("Raw products from service:", result.products?.[0]);
    
    // Map quantity to stock for frontend compatibility
    const mappedProducts = result.products?.map(product => {
      // Convert Mongoose document to plain object if needed
      const plainProduct = product.toObject ? product.toObject() : product;
      
      const mapped = {
        ...plainProduct,
        _id: plainProduct._id || plainProduct.id, // Ensure _id is always present
        stock: plainProduct.quantity || 0, // Map quantity to stock for frontend
        // Also determine status based on stock for proper display
        status: (plainProduct.quantity || 0) === 0 ? 'out_of_stock' : (plainProduct.available ? 'active' : 'draft')
      };
      
      console.log("Mapped product:", mapped);
      return mapped;
    }) || [];
    
    console.log("Final mapped products:", mappedProducts[0]);

    return NextResponse.json({
      message: "Products retrieved successfully",
      products: mappedProducts,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get Products API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
        { message: "Only vendors can create products" },
        { status: 403 }
      );
    }

    // Get vendor profile for the authenticated user
    const vendorResult = await vendorService.getVendorByUserId(user.id);
    if (!vendorResult.success) {
      return NextResponse.json(
        { 
          message: "Vendor profile not found. Please complete your vendor registration.",
          redirectTo: "/vendor/onboarding"
        },
        { status: 404 }
      );
    }
    
    const productData = await request.json();
    
    // Basic validation
    const requiredFields = ["name", "description", "price", "category", "stock", "unit"];
    const missingFields = requiredFields.filter(field => !productData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }
    
    // Validate price and stock are positive numbers
    if (productData.price <= 0 || productData.stock < 0) {
      return NextResponse.json(
        { message: "Price must be positive and stock must be non-negative" },
        { status: 400 }
      );
    }
    
    // Map form fields to product service expected fields
    const createProductData = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      quantity: productData.stock, // Form uses 'stock', service expects 'quantity'
      unit: productData.unit,
      images: productData.images || [],
      organic: productData.organic || false,
      harvestDate: productData.harvestDate ? new Date(productData.harvestDate) : undefined,
      vendorId: vendorResult.data._id.toString() // Use vendor ID, not user ID (convert to string)
    };
    
    // Delegate to service layer
    const result = await productService.createProduct(createProductData, vendorResult.data._id.toString());
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      message: "Product created successfully",
      product: result.data,
    }, { status: 201 });
  } catch (error) {
    console.error("Create Product API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}