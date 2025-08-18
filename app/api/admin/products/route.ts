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

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request)
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    await connectDB()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const vendor = searchParams.get("vendor")

    // Build filter
    const filter: any = {}
    if (status && status !== 'all') {
      filter.status = status
    }
    if (category && category !== 'all') {
      filter.category = category
    }
    if (vendor && vendor !== 'all') {
      filter.vendor = vendor
    }

    // Get products with pagination
    const skip = (page - 1) * limit
    const products = await productRepo.getProducts(filter, {
      sort: { createdAt: -1 },
      limit,
      skip
    })
    const totalProducts = await productRepo.countProducts(filter)

    // Transform product data for admin view
    const transformedProducts = products.map((product: any) => ({
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      vendor: product.vendor,
      status: product.status,
      stock: product.stock,
      images: product.images,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }))

    return NextResponse.json({
      message: "Products fetched successfully",
      data: {
        products: transformedProducts,
        pagination: {
          page,
          limit,
          total: totalProducts,
          totalPages: Math.ceil(totalProducts / limit)
        }
      }
    })
  } catch (error) {
    console.error("Error in admin products API:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request)
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    await connectDB()
    const { productId, action, data } = await request.json()

    if (!productId || !action) {
      return NextResponse.json(
        { message: "Product ID and action are required" },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'update_status':
        result = await productRepo.updateProduct(productId, { status: data.status })
        break
      case 'archive_product':
        result = await productRepo.updateProduct(productId, { status: 'archived' })
        break
      case 'delete_product':
        result = await productRepo.deleteProduct(productId)
        break
      case 'update_product':
        result = await productRepo.updateProduct(productId, data)
        break
      default:
        return NextResponse.json(
          { message: "Invalid action" },
          { status: 400 }
        )
    }

    if (!result) {
      return NextResponse.json(
        { message: "Product not found or operation failed" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Product updated successfully",
      data: result
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
