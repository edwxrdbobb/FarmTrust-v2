import { NextRequest, NextResponse } from "next/server"
import * as productRepo from "@/repositories/product_repo"
import * as userService from "@/services/auth_service"
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
  { params }: { params: Promise<{ productId: string }> }
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
    const { productId } = await params
    const product = await productRepo.getProductById(productId)
    
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      )
    }

    // Ensure we have a single product object
    const productObj = Array.isArray(product) ? product[0] : product
    
    if (!productObj) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      )
    }

    const productData = {
      id: (productObj as any)._id,
      name: (productObj as any).name,
      description: (productObj as any).description,
      price: (productObj as any).price,
      category: (productObj as any).category,
      vendor: (productObj as any).vendor,
      status: (productObj as any).status,
      stock: (productObj as any).stock,
      images: (productObj as any).images,
      createdAt: (productObj as any).createdAt,
      updatedAt: (productObj as any).updatedAt
    }

    return NextResponse.json({
      message: "Product details fetched successfully",
      product: productData
    })
  } catch (error) {
    console.error("Error fetching product details:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
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
    const { productId } = await params
    const updateData = await request.json()
    
    const updatedProduct = await productRepo.updateProduct(productId, updateData)
    
    if (!updatedProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      )
    }

    const productData = {
      id: (updatedProduct as any)._id,
      name: (updatedProduct as any).name,
      description: (updatedProduct as any).description,
      price: (updatedProduct as any).price,
      category: (updatedProduct as any).category,
      vendor: (updatedProduct as any).vendor,
      status: (updatedProduct as any).status,
      stock: (updatedProduct as any).stock,
      images: (updatedProduct as any).images,
      createdAt: (updatedProduct as any).createdAt,
      updatedAt: (updatedProduct as any).updatedAt
    }

    return NextResponse.json({
      message: "Product updated successfully",
      product: productData
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
