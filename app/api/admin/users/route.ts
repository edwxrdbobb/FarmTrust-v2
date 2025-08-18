import { NextRequest, NextResponse } from "next/server"
import * as userService from "@/services/auth_service"
import * as userRepo from "@/repositories/user_repo"
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
    const role = searchParams.get("role")
    const status = searchParams.get("status")

    // Build filter
    const filter: any = {}
    if (role && role !== 'all') {
      filter.role = role
    }
    if (status && status !== 'all') {
      filter.status = status
    }

    // Get users with pagination
    const skip = (page - 1) * limit
    const users = await userRepo.getUsers(filter)
    const totalUsers = await userRepo.countUsers(filter)
    
    // Apply pagination manually
    const paginatedUsers = users.slice(skip, skip + limit)

    // Transform user data for admin view
    const transformedUsers = paginatedUsers.map((user: any) => ({
      id: user._id,
      name: user.name || 'Unknown User',
      email: user.email,
      role: user.role || 'buyer',
      status: user.isActive === false ? 'inactive' : user.status || 'active',
      joinDate: user.createdAt,
      avatar: user.image,
      phone: user.phone,
      verified: user.verified,
      department: user.department
    }))

    return NextResponse.json({
      message: "Users fetched successfully",
              data: {
          users: transformedUsers,
          pagination: {
            page,
            limit,
            total: totalUsers,
            totalPages: Math.ceil(totalUsers / limit)
          }
        }
    })
  } catch (error) {
    console.error("Error in admin users API:", error)
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
    const { userId, action, data } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { message: "User ID and action are required" },
        { status: 400 }
      )
    }

    let result
    let success = false

    switch (action) {
      case 'update_status':
        result = await userRepo.updateUser(userId, { status: data.status })
        success = !!result
        break
      case 'update_role':
        result = await userRepo.updateUser(userId, { role: data.role })
        success = !!result
        break
      case 'update_profile':
        result = await userService.updateUserProfile(userId, data)
        success = result?.success || false
        break
      case 'delete_user':
        result = await userRepo.deleteUser(userId)
        success = !!result
        break
      default:
        return NextResponse.json(
          { message: "Invalid action" },
          { status: 400 }
        )
    }

    if (!success) {
      return NextResponse.json(
        { message: "Failed to update user" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: "User updated successfully",
      data: result?.user || result || { success: true }
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}