import * as analyticsRepo from "@/repositories/analytics_repo";
import * as orderRepo from "@/repositories/order_repo";
import * as productRepo from "@/repositories/product_repo";
import * as userRepo from "@/repositories/user_repo";
import * as vendorRepo from "@/repositories/vendor_repo";
import * as reviewRepo from "@/repositories/review_repo";
import { connectDB } from "@/lib/db";
import { startTransaction, commitTransaction, abortTransaction } from "@/lib/db_transaction";
import { Types } from "mongoose";

export interface AnalyticsData {
  event: string;
  userId?: string;
  vendorId?: string;
  productId?: string;
  orderId?: string;
  category?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: any[];
  topVendors: any[];
  salesByCategory: any[];
  salesByPeriod: any[];
}

export interface UserMetrics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  usersByRole: any[];
  userGrowth: any[];
  topBuyers: any[];
}

export interface ProductMetrics {
  totalProducts: number;
  newProducts: number;
  topRatedProducts: any[];
  lowStockProducts: any[];
  productsByCategory: any[];
  productPerformance: any[];
}

export interface VendorMetrics {
  totalVendors: number;
  activeVendors: number;
  newVendors: number;
  topPerformingVendors: any[];
  vendorRatings: any[];
  vendorSales: any[];
}

export enum AnalyticsEvent {
  PAGE_VIEW = 'page_view',
  PRODUCT_VIEW = 'product_view',
  PRODUCT_SEARCH = 'product_search',
  ADD_TO_CART = 'add_to_cart',
  REMOVE_FROM_CART = 'remove_from_cart',
  ORDER_PLACED = 'order_placed',
  ORDER_COMPLETED = 'order_completed',
  ORDER_CANCELLED = 'order_cancelled',
  PAYMENT_INITIATED = 'payment_initiated',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',
  USER_REGISTRATION = 'user_registration',
  USER_LOGIN = 'user_login',
  VENDOR_REGISTRATION = 'vendor_registration',
  PRODUCT_CREATED = 'product_created',
  REVIEW_SUBMITTED = 'review_submitted',
  DISPUTE_CREATED = 'dispute_created'
}

// Add missing functions that are being imported by other files
export async function createAnalyticsEvent(eventData: AnalyticsData) {
  return trackEvent(eventData);
}

export async function trackEvent(eventData: AnalyticsData) {
  try {
    await connectDB();
    
    const analytics = await analyticsRepo.createAnalyticsEvent({
      event: eventData.event,
      userId: eventData.userId,
      vendorId: eventData.vendorId,
      productId: eventData.productId,
      orderId: eventData.orderId,
      category: eventData.category,
      value: eventData.value,
      metadata: eventData.metadata || {},
      timestamp: new Date(),
      createdAt: new Date()
    });

    return { success: true, data: analytics };
  } catch (error) {
    console.error("Error tracking analytics event:", error);
    return { success: false, error: "Failed to track event" };
  }
}

// Add basic implementations for missing functions
export async function getSalesData(vendorId?: string, startDate?: Date, endDate?: Date) {
  try {
    await connectDB();
    const orders = await orderRepo.getOrders({}, {});
    return { success: true, data: orders };
  } catch (error) {
    return { success: false, error: "Failed to get sales data" };
  }
}

export async function getTopProducts(limit: number = 10) {
  try {
    await connectDB();
    const products = await productRepo.getProducts({}, { limit });
    return { success: true, data: products };
  } catch (error) {
    return { success: false, error: "Failed to get top products" };
  }
}

export async function getTopVendors(limit: number = 10) {
  try {
    await connectDB();
    const vendors = await vendorRepo.getVendors({}, { limit });
    return { success: true, data: vendors };
  } catch (error) {
    return { success: false, error: "Failed to get top vendors" };
  }
}

export async function getSalesByCategory() {
  try {
    await connectDB();
    return { success: true, data: [] };
  } catch (error) {
    return { success: false, error: "Failed to get sales by category" };
  }
}

export async function getSalesByPeriod(startDate?: Date, endDate?: Date) {
  try {
    await connectDB();
    return { success: true, data: [] };
  } catch (error) {
    return { success: false, error: "Failed to get sales by period" };
  }
}

export async function countUsersByDateRange(startDate?: Date, endDate?: Date) {
  try {
    await connectDB();
    const count = await userRepo.countUsers();
    return { success: true, data: count };
  } catch (error) {
    return { success: false, error: "Failed to count users" };
  }
}

export async function getActiveUsersCount() {
  try {
    await connectDB();
    const users = await userRepo.getUsers({ isActive: true });
    return { success: true, data: users.length };
  } catch (error) {
    return { success: false, error: "Failed to get active users count" };
  }
}

export async function getUserGrowth() {
  try {
    await connectDB();
    return { success: true, data: [] };
  } catch (error) {
    return { success: false, error: "Failed to get user growth" };
  }
}

export async function getTopBuyers(limit: number = 10) {
  try {
    await connectDB();
    return { success: true, data: [] };
  } catch (error) {
    return { success: false, error: "Failed to get top buyers" };
  }
}

export async function countProductsByDateRange(startDate?: Date, endDate?: Date) {
  try {
    await connectDB();
    const count = await productRepo.countProducts();
    return { success: true, data: count };
  } catch (error) {
    return { success: false, error: "Failed to count products" };
  }
}

export async function getTopRatedProducts(limit: number = 10) {
  try {
    await connectDB();
    const products = await productRepo.getProducts({}, { limit });
    return { success: true, data: products };
  } catch (error) {
    return { success: false, error: "Failed to get top rated products" };
  }
}

export async function getLowStockProducts(limit: number = 10) {
  try {
    await connectDB();
    const products = await productRepo.getProducts({}, { limit });
    return { success: true, data: products };
  } catch (error) {
    return { success: false, error: "Failed to get low stock products" };
  }
}

export async function getActiveVendorsCount() {
  try {
    await connectDB();
    const vendors = await vendorRepo.getVendors({ isActive: true });
    return { success: true, data: vendors.length };
  } catch (error) {
    return { success: false, error: "Failed to get active vendors count" };
  }
}

export async function countVendorsByDateRange(startDate?: Date, endDate?: Date) {
  try {
    await connectDB();
    const count = await vendorRepo.countVendors();
    return { success: true, data: count };
  } catch (error) {
    return { success: false, error: "Failed to count vendors" };
  }
}

export async function getVendorRatingsDistribution() {
  try {
    await connectDB();
    return { success: true, data: [] };
  } catch (error) {
    return { success: false, error: "Failed to get vendor ratings distribution" };
  }
}

export async function getVendorSalesData(vendorId?: string) {
  try {
    await connectDB();
    return { success: true, data: [] };
  } catch (error) {
    return { success: false, error: "Failed to get vendor sales data" };
  }
}

export async function getVendorOrders(vendorId: string) {
  try {
    await connectDB();
    const orders = await orderRepo.getOrders({}, {});
    return { success: true, data: orders };
  } catch (error) {
    return { success: false, error: "Failed to get vendor orders" };
  }
}

export async function getVendorProducts(vendorId: string) {
  try {
    await connectDB();
    const products = await productRepo.getProducts({ vendor: vendorId }, {});
    return { success: true, data: products };
  } catch (error) {
    return { success: false, error: "Failed to get vendor products" };
  }
}

export async function getVendorReviews(vendorId: string) {
  try {
    await connectDB();
    const reviews = await reviewRepo.getReviews({}, {});
    return { success: true, data: reviews };
  } catch (error) {
    return { success: false, error: "Failed to get vendor reviews" };
  }
}

export async function getUserOrders(userId: string) {
  try {
    await connectDB();
    const orders = await orderRepo.getOrders({ user: userId }, {});
    return { success: true, data: orders };
  } catch (error) {
    return { success: false, error: "Failed to get user orders" };
  }
}

export async function getUserReviews(userId: string) {
  try {
    await connectDB();
    const reviews = await reviewRepo.getReviews({ user: userId }, {});
    return { success: true, data: reviews };
  } catch (error) {
    return { success: false, error: "Failed to get user reviews" };
  }
}

export async function getAnalyticsEvents(filters?: any) {
  try {
    await connectDB();
    const events = await analyticsRepo.getAnalyticsEvents(filters || {}, {});
    return { success: true, data: events };
  } catch (error) {
    return { success: false, error: "Failed to get analytics events" };
  }
}

export async function getEventCount(eventType: string) {
  try {
    await connectDB();
    const count = await analyticsRepo.getEventCount(eventType);
    return { success: true, data: count };
  } catch (error) {
    return { success: false, error: "Failed to get event count" };
  }
}

export async function getProductViews(productId: string) {
  try {
    await connectDB();
    return { success: true, data: 0 };
  } catch (error) {
    return { success: false, error: "Failed to get product views" };
  }
}

export async function getProductOrderCounts(productId: string) {
  try {
    await connectDB();
    const orders = await orderRepo.getOrders({}, {});
    return { success: true, data: orders.length };
  } catch (error) {
    return { success: false, error: "Failed to get product order counts" };
  }
}

export async function getSalesMetrics(dateRange: DateRange, vendorId?: string): Promise<{ success: boolean; data?: SalesMetrics; error?: string }> {
  try {
    await connectDB();
    
    // Get total revenue and orders
    const salesData = await orderRepo.getSalesData(dateRange, vendorId);
    
    // Get top products
    const topProducts = await orderRepo.getTopProducts(dateRange, vendorId, 10);
    
    // Get top vendors (only if not filtering by vendor)
    const topVendors = vendorId ? [] : await orderRepo.getTopVendors(dateRange, 10);
    
    // Get sales by category
    const salesByCategory = await orderRepo.getSalesByCategory(dateRange, vendorId);
    
    // Get sales by period (daily/weekly/monthly)
    const salesByPeriod = await orderRepo.getSalesByPeriod(dateRange, vendorId, 'daily');
    
    const metrics: SalesMetrics = {
      totalRevenue: salesData.totalRevenue || 0,
      totalOrders: salesData.totalOrders || 0,
      averageOrderValue: salesData.totalOrders > 0 ? salesData.totalRevenue / salesData.totalOrders : 0,
      topProducts,
      topVendors,
      salesByCategory,
      salesByPeriod
    };

    return { success: true, data: metrics };
  } catch (error) {
    console.error("Error getting sales metrics:", error);
    return { success: false, error: "Failed to get sales metrics" };
  }
}

export async function getUserMetrics(dateRange: DateRange): Promise<{ success: boolean; data?: UserMetrics; error?: string }> {
  try {
    await connectDB();
    
    // Get total users
    const totalUsers = await userRepo.countUsers();
    
    // Get new users in date range
    const newUsers = await userRepo.countUsersByDateRange(dateRange);
    
    // Get active users (users who placed orders in date range)
    const activeUsers = await orderRepo.getActiveUsersCount(dateRange);
    
    // Get users by role
    const usersByRole = await userRepo.getUsersByRole();
    
    // Get user growth over time
    const userGrowth = await userRepo.getUserGrowth(dateRange);
    
    // Get top buyers
    const topBuyers = await orderRepo.getTopBuyers(dateRange, 10);
    
    const metrics: UserMetrics = {
      totalUsers,
      newUsers,
      activeUsers,
      usersByRole,
      userGrowth,
      topBuyers
    };

    return { success: true, data: metrics };
  } catch (error) {
    console.error("Error getting user metrics:", error);
    return { success: false, error: "Failed to get user metrics" };
  }
}

export async function getProductMetrics(dateRange: DateRange, vendorId?: string): Promise<{ success: boolean; data?: ProductMetrics; error?: string }> {
  try {
    await connectDB();
    
    // Get total products
    const totalProducts = await productRepo.countProducts(vendorId);
    
    // Get new products in date range
    const newProducts = await productRepo.countProductsByDateRange(dateRange, vendorId);
    
    // Get top rated products
    const topRatedProducts = await productRepo.getTopRatedProducts(vendorId, 10);
    
    // Get low stock products
    const lowStockProducts = await productRepo.getLowStockProducts(vendorId, 10);
    
    // Get products by category
    const productsByCategory = await productRepo.getProductsByCategory(vendorId);
    
    // Get product performance (views, orders, etc.)
    const productPerformance = await getProductPerformance(dateRange, vendorId);
    
    const metrics: ProductMetrics = {
      totalProducts,
      newProducts,
      topRatedProducts,
      lowStockProducts,
      productsByCategory,
      productPerformance
    };

    return { success: true, data: metrics };
  } catch (error) {
    console.error("Error getting product metrics:", error);
    return { success: false, error: "Failed to get product metrics" };
  }
}

export async function getVendorMetrics(dateRange: DateRange): Promise<{ success: boolean; data?: VendorMetrics; error?: string }> {
  try {
    await connectDB();
    
    // Get total vendors
    const totalVendors = await vendorRepo.countVendors();
    
    // Get active vendors (vendors with orders in date range)
    const activeVendors = await orderRepo.getActiveVendorsCount(dateRange);
    
    // Get new vendors in date range
    const newVendors = await vendorRepo.countVendorsByDateRange(dateRange);
    
    // Get top performing vendors
    const topPerformingVendors = await orderRepo.getTopVendors(dateRange, 10);
    
    // Get vendor ratings distribution
    const vendorRatings = await vendorRepo.getVendorRatingsDistribution();
    
    // Get vendor sales data
    const vendorSales = await orderRepo.getVendorSalesData(dateRange);
    
    const metrics: VendorMetrics = {
      totalVendors,
      activeVendors,
      newVendors,
      topPerformingVendors,
      vendorRatings,
      vendorSales
    };

    return { success: true, data: metrics };
  } catch (error) {
    console.error("Error getting vendor metrics:", error);
    return { success: false, error: "Failed to get vendor metrics" };
  }
}

export async function getDashboardMetrics(userId: string, dateRange: DateRange) {
  try {
    await connectDB();
    
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    let metrics: any = {};

    if (user.role === 'admin') {
      // Admin dashboard - get all metrics
      const [salesMetrics, userMetrics, productMetrics, vendorMetrics] = await Promise.all([
        getSalesMetrics(dateRange),
        getUserMetrics(dateRange),
        getProductMetrics(dateRange),
        getVendorMetrics(dateRange)
      ]);

      metrics = {
        sales: salesMetrics.data,
        users: userMetrics.data,
        products: productMetrics.data,
        vendors: vendorMetrics.data
      };
    } else if (user.role === 'vendor') {
      // Vendor dashboard - get vendor-specific metrics
      const vendor = await vendorRepo.getVendorByUserId(userId);
      if (!vendor) {
        return { success: false, error: "Vendor profile not found" };
      }

      const [salesMetrics, productMetrics] = await Promise.all([
        getSalesMetrics(dateRange, vendor._id.toString()),
        getProductMetrics(dateRange, vendor._id.toString())
      ]);

      // Get vendor-specific stats
      const vendorStats = await getVendorStats(vendor._id.toString(), dateRange);

      metrics = {
        sales: salesMetrics.data,
        products: productMetrics.data,
        vendor: vendorStats.data
      };
    } else {
      // Regular user dashboard - get user-specific metrics
      const userStats = await getUserStats(userId, dateRange);
      metrics = {
        user: userStats.data
      };
    }

    return { success: true, data: metrics };
  } catch (error) {
    console.error("Error getting dashboard metrics:", error);
    return { success: false, error: "Failed to get dashboard metrics" };
  }
}

export async function getVendorStats(vendorId: string, dateRange: DateRange) {
  try {
    await connectDB();
    
    const vendor = await vendorRepo.getVendorById(vendorId);
    if (!vendor) {
      return { success: false, error: "Vendor not found" };
    }

    // Get vendor orders
    const orders = await orderRepo.getVendorOrders(vendorId, dateRange);
    
    // Get vendor products
    const products = await productRepo.getVendorProducts(vendorId);
    
    // Get vendor reviews
    const reviews = await reviewRepo.getVendorReviews(vendorId);
    
    // Calculate stats
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalProducts = products.length;
    const averageRating = reviews.length > 0 ? 
      reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length : 0;

    const stats = {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalProducts,
      averageRating,
      totalReviews: reviews.length,
      recentOrders: orders.slice(0, 5),
      topProducts: products.sort((a: any, b: any) => (b.totalSales || 0) - (a.totalSales || 0)).slice(0, 5)
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error getting vendor stats:", error);
    return { success: false, error: "Failed to get vendor statistics" };
  }
}

export async function getUserStats(userId: string, dateRange: DateRange) {
  try {
    await connectDB();
    
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Get user orders
    const orders = await orderRepo.getUserOrders(userId, dateRange);
    
    // Get user reviews
    const reviews = await reviewRepo.getUserReviews(userId);
    
    // Calculate stats
    const totalSpent = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    const stats = {
      totalSpent,
      totalOrders,
      averageOrderValue,
      totalReviews: reviews.length,
      recentOrders: orders.slice(0, 5),
      favoriteCategories: await getUserFavoriteCategories(userId)
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return { success: false, error: "Failed to get user statistics" };
  }
}



export async function getConversionMetrics(dateRange: DateRange, vendorId?: string) {
  try {
    await connectDB();
    
    // Get funnel data
    const productViews = await analyticsRepo.getEventCount(AnalyticsEvent.PRODUCT_VIEW, dateRange, vendorId);
    const addToCarts = await analyticsRepo.getEventCount(AnalyticsEvent.ADD_TO_CART, dateRange, vendorId);
    const ordersPlaced = await analyticsRepo.getEventCount(AnalyticsEvent.ORDER_PLACED, dateRange, vendorId);
    const ordersCompleted = await analyticsRepo.getEventCount(AnalyticsEvent.ORDER_COMPLETED, dateRange, vendorId);
    
    // Calculate conversion rates
    const viewToCartRate = productViews > 0 ? (addToCarts / productViews) * 100 : 0;
    const cartToOrderRate = addToCarts > 0 ? (ordersPlaced / addToCarts) * 100 : 0;
    const orderCompletionRate = ordersPlaced > 0 ? (ordersCompleted / ordersPlaced) * 100 : 0;
    const overallConversionRate = productViews > 0 ? (ordersCompleted / productViews) * 100 : 0;

    const metrics = {
      funnel: {
        productViews,
        addToCarts,
        ordersPlaced,
        ordersCompleted
      },
      conversionRates: {
        viewToCartRate: Math.round(viewToCartRate * 100) / 100,
        cartToOrderRate: Math.round(cartToOrderRate * 100) / 100,
        orderCompletionRate: Math.round(orderCompletionRate * 100) / 100,
        overallConversionRate: Math.round(overallConversionRate * 100) / 100
      }
    };

    return { success: true, data: metrics };
  } catch (error) {
    console.error("Error getting conversion metrics:", error);
    return { success: false, error: "Failed to get conversion metrics" };
  }
}

// Helper functions
async function getProductPerformance(dateRange: DateRange, vendorId?: string) {
  const productViews = await analyticsRepo.getProductViews(dateRange, vendorId);
  const productOrders = await orderRepo.getProductOrderCounts(dateRange, vendorId);
  
  // Combine views and orders data
  const performance = productViews.map((view: any) => {
    const orderData = productOrders.find((order: any) => 
      order.productId.toString() === view.productId.toString()
    );
    
    return {
      productId: view.productId,
      productName: view.productName,
      views: view.views,
      orders: orderData ? orderData.orders : 0,
      conversionRate: view.views > 0 ? ((orderData ? orderData.orders : 0) / view.views) * 100 : 0
    };
  });
  
  return performance.sort((a: any, b: any) => b.conversionRate - a.conversionRate);
}

async function getUserFavoriteCategories(userId: string) {
  const orders = await orderRepo.getUserOrders(userId, {
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
    endDate: new Date()
  });
  
  const categoryCount: Record<string, number> = {};
  
  orders.forEach((order: any) => {
    order.items.forEach((item: any) => {
      const category = item.product.category;
      categoryCount[category] = (categoryCount[category] || 0) + item.quantity;
    });
  });
  
  return Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));
}