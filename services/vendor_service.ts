import * as vendorRepo from "@/repositories/vendor_repo";
import * as userRepo from "@/repositories/user_repo";
import * as productRepo from "@/repositories/product_repo";
import * as orderRepo from "@/repositories/order_repo";
import { startSession } from "mongoose";
import { connectDB } from "@/lib/db";
import { startTransaction, commitTransaction, abortTransaction } from "@/lib/db_transaction";
import { Types } from "mongoose";
import * as notificationService from "./notification_service";

export interface CreateVendorData {
  businessName: string;
  businessType: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  businessLicense?: string;
  taxId?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingNumber: string;
  };
}

export interface UpdateVendorData {
  businessName?: string;
  businessType?: string;
  description?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactInfo?: {
    phone: string;
    email: string;
    website?: string;
  };
  businessLicense?: string;
  taxId?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingNumber: string;
  };
  isVerified?: boolean;
  isActive?: boolean;
}

export enum VendorStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected'
}

export async function createVendor(userId: string, vendorData: CreateVendorData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Validate user exists
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Check if user already has a vendor profile
    const existingVendor = await vendorRepo.getVendorByUserId(userId);
    if (existingVendor) {
      return { success: false, error: "User already has a vendor profile" };
    }

    // Create vendor profile with proper field mapping to match the model
    const vendorCreateData = {
      userId: userId,
      farmName: vendorData.businessName || vendorData.farmName,
      farmerType: vendorData.businessType || vendorData.farmerType,
      description: vendorData.description,
      location: vendorData.location || vendorData.address?.street,
      // Map other fields as needed
      rating: 0,
      totalReviews: 0,
      verified: false
    };
    
    const vendor = await vendorRepo.createVendor(vendorCreateData, { session });

    // Update user role to vendor
    await userRepo.updateUser(userId, { role: 'vendor' }, { session });

    await commitTransaction(session);
    return { success: true, data: vendor };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error creating vendor:", error);
    return { success: false, error: "Failed to create vendor profile" };
  }
}

export async function getVendorById(vendorId: string) {
  try {
    await connectDB();
    const vendor = await vendorRepo.getVendorById(vendorId);
    
    if (!vendor) {
      return { success: false, error: "Vendor not found" };
    }

    return { success: true, data: vendor };
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return { success: false, error: "Failed to fetch vendor" };
  }
}

export async function getVendorByUserId(userId: string) {
  try {
    await connectDB();
    const vendor = await vendorRepo.getVendorByUserId(userId);
    
    if (!vendor) {
      return { success: false, error: "Vendor profile not found" };
    }

    return { success: true, data: vendor };
  } catch (error) {
    console.error("Error fetching vendor by user ID:", error);
    return { success: false, error: "Failed to fetch vendor profile" };
  }
}

export async function updateVendor(vendorId: string, updateData: UpdateVendorData, userId?: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const vendor = await vendorRepo.getVendorById(vendorId);
    if (!vendor) {
      return { success: false, error: "Vendor not found" };
    }

    // If userId is provided, verify ownership
    if (userId && vendor.userId.toString() !== userId) {
      return { success: false, error: "Unauthorized to update this vendor profile" };
    }

    const updatedVendor = await vendorRepo.updateVendorById(vendorId, {
      ...updateData,
      updatedAt: new Date()
    }, { session, new: true });

    await commitTransaction(session);
    return { success: true, data: updatedVendor };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error updating vendor:", error);
    return { success: false, error: "Failed to update vendor profile" };
  }
}

export async function getAllVendors(page: number = 1, limit: number = 10, filters?: any) {
  try {
    await connectDB();
    const skip = (page - 1) * limit;
    const vendors = await vendorRepo.getVendors(filters || {}, { limit, skip, sort: { createdAt: -1 } });
    return { success: true, data: vendors };
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return { success: false, error: "Failed to fetch vendors" };
  }
}

export async function suspendVendor(vendorId: string, adminId: string, reason: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const vendor = await vendorRepo.getVendorById(vendorId);
    if (!vendor) {
      return { success: false, error: "Vendor not found" };
    }

    const updatedVendor = await vendorRepo.updateVendorById(vendorId, { 
      status: "suspended", 
      suspendedAt: new Date() 
    }, { session, new: true });

    // Send notification to vendor
    await notificationService.createNotification({
      userId: vendor.userId,
      title: "Account Suspended",
      message: `Your vendor account has been suspended. Reason: ${reason}`,
      type: "system",
      priority: "high"
    });

    await commitTransaction(session);
    return { success: true, data: updatedVendor };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error suspending vendor:", error);
    return { success: false, error: "Failed to suspend vendor" };
  }
}

export async function verifyVendor(vendorId: string, adminId: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const vendor = await vendorRepo.getVendorById(vendorId);
    if (!vendor) {
      return { success: false, error: "Vendor not found" };
    }

    const updatedVendor = await vendorRepo.updateVendorById(vendorId, { 
      isVerified: true, 
      verifiedAt: new Date() 
    }, { session, new: true });

    // Send notification to vendor
    await notificationService.createNotification({
      userId: vendor.userId,
      title: "Account Verified",
      message: "Congratulations! Your vendor account has been verified.",
      type: "vendor_approval",
      priority: "high"
    });

    await commitTransaction(session);
    return { success: true, data: updatedVendor };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error verifying vendor:", error);
    return { success: false, error: "Failed to verify vendor" };
  }
}

export async function getVendorDashboard(vendorId: string) {
  try {
    await connectDB();
    
    const vendor = await vendorRepo.getVendorById(vendorId);
    if (!vendor) {
      return { success: false, error: "Vendor not found" };
    }

    // Get current stats
    const totalProducts = await productRepo.countProductsByVendor(vendorId);
    const totalOrders = await orderRepo.countOrdersByVendor(vendorId);
    const totalRevenue = await orderRepo.getTotalRevenueByVendor(vendorId);
    const pendingOrders = await orderRepo.countOrdersByVendorAndStatus(vendorId, 'pending');
    const shippingOrders = await orderRepo.countOrdersByVendorAndStatus(vendorId, 'confirmed');
    
    // Get out of stock products
    const outOfStockProducts = await productRepo.countProducts({ 
      vendorId, 
      deleted_at: null, 
      quantity: { $lte: 0 } 
    });

    // Calculate previous month for comparison (mock calculations)
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get previous period data for trend calculation (simplified)
    const lastMonthRevenue = totalRevenue * 0.9; // Mock 10% growth
    const revenueChange = totalRevenue > 0 ? Math.round(((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0;

    // Get recent orders and top products
    const recentOrders = await orderRepo.getRecentOrdersByVendor(vendorId, 5);
    const topProducts = await productRepo.getVendorTopProducts(vendorId, 5);

    // Generate sales chart data (last 30 days)
    const salesChart = await generateSalesChartData(vendorId, 30);

    // Format the response according to API specification
    const stats = {
      totalSales: {
        value: totalRevenue,
        change: revenueChange > 0 ? `+${revenueChange}%` : `${revenueChange}%`,
        trend: revenueChange >= 0 ? "up" : "down"
      },
      activeProducts: {
        value: totalProducts - outOfStockProducts,
        change: outOfStockProducts > 0 ? `${outOfStockProducts} out of stock` : "All in stock"
      },
      pendingOrders: {
        value: pendingOrders,
        change: shippingOrders > 0 ? `${shippingOrders} need shipping` : "No urgent orders"
      },
      customerRating: {
        value: vendor.rating > 0 ? `${vendor.rating}/5` : "No ratings yet",
        change: vendor.totalReviews > 0 ? `Based on ${vendor.totalReviews} reviews` : "No reviews yet"
      }
    };

    return {
      success: true,
      data: {
        stats,
        salesChart,
        recentOrders: recentOrders.map(order => ({
          _id: order._id,
          orderNumber: order.orderNumber || `ORD-${order._id.toString().slice(-6)}`,
          status: order.status,
          total: order.totalAmount || calculateOrderTotal(order),
          customer: order.buyerId ? `${order.buyerId.firstName} ${order.buyerId.lastName}` : 'Unknown',
          createdAt: order.createdAt
        })),
        topProducts: topProducts.map(product => ({
          _id: product._id,
          name: product.name,
          sales: product.sales || 0,
          revenue: product.sales * product.price || 0,
          rating: product.rating || 0,
          image: product.image
        }))
      }
    };
  } catch (error) {
    console.error("Error fetching vendor dashboard:", error);
    return { success: false, error: "Failed to fetch vendor dashboard" };
  }
}

// Helper function to generate sales chart data
async function generateSalesChartData(vendorId: string, days: number) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  try {
    const salesData = await orderRepo.getVendorSalesAnalytics(vendorId, startDate, endDate);
    
    // Fill in missing days with zero values
    const chartData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingData = salesData.find(item => 
        item._id.year === currentDate.getFullYear() &&
        item._id.month === currentDate.getMonth() + 1 &&
        item._id.day === currentDate.getDate()
      );
      
      chartData.push({
        date: dateStr,
        revenue: existingData?.revenue || 0,
        orders: existingData?.orderCount || 0
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return chartData;
  } catch (error) {
    console.error("Error generating sales chart data:", error);
    return [];
  }
}

// Helper function to calculate order total
function calculateOrderTotal(order: any) {
  if (!order.items || !Array.isArray(order.items)) return 0;
  
  return order.items.reduce((total: number, item: any) => {
    return total + (item.quantity * item.price);
  }, 0);
}

export async function getVendorAnalytics(vendorId: string, period: string = '30d') {
  try {
    await connectDB();
    
    const vendor = await vendorRepo.getVendorById(vendorId);
    if (!vendor) {
      return { success: false, error: "Vendor not found" };
    }

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get analytics data
    const salesData = await orderRepo.getVendorSalesAnalytics(vendorId, startDate, endDate);
    const productViews = await productRepo.getVendorProductViews(vendorId, startDate, endDate);
    const topProducts = await productRepo.getVendorTopProducts(vendorId, 5);

    return {
      success: true,
      data: {
        period,
        salesData,
        productViews,
        topProducts
      }
    };
  } catch (error) {
    console.error("Error fetching vendor analytics:", error);
    return { success: false, error: "Failed to fetch vendor analytics" };
  }
}

export async function updateVendorRating(vendorId: string, newRating: number, reviewCount: number) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const vendor = await vendorRepo.getVendorById(vendorId);
    if (!vendor) {
      return { success: false, error: "Vendor not found" };
    }

    // Calculate new average rating
    const currentTotal = vendor.rating * vendor.totalReviews;
    const newTotal = currentTotal + newRating;
    const newTotalReviews = vendor.totalReviews + 1;
    const newAverageRating = newTotal / newTotalReviews;

    const updatedVendor = await vendorRepo.updateVendorById(vendorId, {
      rating: Math.round(newAverageRating * 10) / 10, // Round to 1 decimal place
      totalReviews: newTotalReviews
    }, { session, new: true });

    await commitTransaction(session);
    return { success: true, data: updatedVendor };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error updating vendor rating:", error);
    return { success: false, error: "Failed to update vendor rating" };
  }
}

export async function incrementVendorSales(vendorId: string, amount: number) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const vendor = await vendorRepo.getVendorById(vendorId);
    if (!vendor) {
      return { success: false, error: "Vendor not found" };
    }

    const updatedVendor = await vendorRepo.updateVendorById(vendorId, {
      totalSales: vendor.totalSales + amount
    }, { session, new: true });

    await commitTransaction(session);
    return { success: true, data: updatedVendor };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error incrementing vendor sales:", error);
    return { success: false, error: "Failed to increment vendor sales" };
  }
}