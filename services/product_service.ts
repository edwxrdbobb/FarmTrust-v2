import * as productRepo from "@/repositories/product_repo";
import * as categoryRepo from "@/repositories/category_repo";
import * as vendorRepo from "@/repositories/vendor_repo";
import { connectDB } from "@/lib/db";
import { startTransaction, commitTransaction, abortTransaction } from "@/lib/db_transaction";
import { Types } from "mongoose";

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  vendorId: string;
  images?: string[];
  quantity: number;
  unit: string;
  specifications?: Record<string, any>;
  organic?: boolean;
  harvestDate?: Date;
  expiryDate?: Date;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  categoryId?: string;
  images?: string[];
  quantity?: number;
  unit?: string;
  specifications?: Record<string, any>;
  organic?: boolean;
  harvestDate?: Date;
  expiryDate?: Date;
  isActive?: boolean;
}

export async function createProduct(data: CreateProductData, vendorId: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Validate vendor exists
    const vendor = await vendorRepo.getVendorById(vendorId);
    if (!vendor) {
      return { success: false, error: "Vendor not found" };
    }

    // Validate category exists (handle both ObjectId and slug)
    let category;
    
    // First check if it's a valid ObjectId
    if (data.category.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a valid ObjectId
      category = await categoryRepo.getCategoryById(data.category);
    } else {
      // It's likely a slug, try to find in database
      category = await categoryRepo.getCategoryBySlug(data.category);
      
      // If not found in database, check against mock categories for development
      if (!category) {
        const mockCategories = [
          { _id: "64f1c1234567890123456789", slug: 'vegetables' },
          { _id: "64f1c1234567890123456790", slug: 'fruits' },
          { _id: "64f1c1234567890123456791", slug: 'grains' },
          { _id: "64f1c1234567890123456792", slug: 'tubers' },
          { _id: "64f1c1234567890123456793", slug: 'legumes' },
          { _id: "64f1c1234567890123456794", slug: 'herbs-spices' },
          { _id: "64f1c1234567890123456795", slug: 'nuts-seeds' },
          { _id: "64f1c1234567890123456796", slug: 'dairy-eggs' },
          { _id: "64f1c1234567890123456797", slug: 'meat-fish' },
          { _id: "64f1c1234567890123456798", slug: 'processed-foods' }
        ];
        
        const mockCategory = mockCategories.find(cat => cat.slug === data.category);
        if (mockCategory) {
          // Use the mock category ID for development
          data.category = mockCategory._id;
          // Set category to truthy so validation passes
          category = { _id: mockCategory._id };
        }
      }
    }
    
    if (!category) {
      return { success: false, error: "Category not found" };
    }
    
    // Ensure we're using the ObjectId
    if (category._id) {
      data.category = category._id;
    }

    // Create product with proper field mapping to match model
    const productData = {
      name: data.name,
      description: data.description,
      price: data.price,
      quantity: data.quantity,
      unit: data.unit,
      categoryId: data.category, // Model expects categoryId, not category
      vendorId: vendorId,
      images: data.images || [], // Ensure images array exists, even if empty
      available: true,
      organic: data.organic || false,
      harvestDate: data.harvestDate,
      expiryDate: data.expiryDate,
    };

    const product = await productRepo.createProduct(productData, session);
    await commitTransaction(session);

    return { success: true, data: product };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error creating product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function getProductById(productId: string) {
  try {
    await connectDB();
    const product = await productRepo.getProductById(productId);
    
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    return { success: true, data: product };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { success: false, error: "Failed to fetch product" };
  }
}

export async function getProductsByVendor(vendorId: string, page: number = 1, limit: number = 10) {
  try {
    await connectDB();
    const result = await productRepo.getProductsByVendor(vendorId, page, limit);
    return { success: true, products: result.products, pagination: result.pagination };
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}

export async function getProductsByCategory(categoryId: string, page: number = 1, limit: number = 10) {
  try {
    await connectDB();
    const result = await productRepo.getProductsByCategory(categoryId, page, limit);
    return { success: true, products: result.products, pagination: result.pagination };
  } catch (error) {
    console.error("Error fetching category products:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}

export async function searchProducts(query: string, filters?: any, page: number = 1, limit: number = 10) {
  try {
    await connectDB();
    const result = await productRepo.searchProducts(query, filters, page, limit);
    return { success: true, products: result.products, pagination: result.pagination };
  } catch (error) {
    console.error("Error searching products:", error);
    return { success: false, error: "Failed to search products" };
  }
}

export async function updateProduct(productId: string, data: UpdateProductData, vendorId: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Verify product belongs to vendor
    const product = await productRepo.getProductById(productId);
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Handle both populated and non-populated vendorId
    let productVendorId: string;
    
    if (typeof product.vendorId === 'object' && product.vendorId._id) {
      // vendorId is populated with vendor object, extract the _id
      productVendorId = product.vendorId._id.toString();
    } else {
      // vendorId is just the ObjectId reference
      productVendorId = product.vendorId.toString();
    }


    if (productVendorId !== vendorId) {
      return { success: false, error: "Unauthorized to update this product" };
    }

    // Validate category if being updated
    if (data.category) {
      let category;
      
      // Check if it's a valid ObjectId
      if (data.category.match(/^[0-9a-fA-F]{24}$/)) {
        category = await categoryRepo.getCategoryById(data.category);
      } else {
        // It's likely a slug, try to find in database
        category = await categoryRepo.getCategoryBySlug(data.category);
        
        // If not found in database, check against mock categories for development
        if (!category) {
          const mockCategories = [
            { _id: "64f1c1234567890123456789", slug: 'vegetables' },
            { _id: "64f1c1234567890123456790", slug: 'fruits' },
            { _id: "64f1c1234567890123456791", slug: 'grains' },
            { _id: "64f1c1234567890123456792", slug: 'tubers' },
            { _id: "64f1c1234567890123456793", slug: 'legumes' },
            { _id: "64f1c1234567890123456794", slug: 'herbs-spices' },
            { _id: "64f1c1234567890123456795", slug: 'nuts-seeds' },
            { _id: "64f1c1234567890123456796", slug: 'dairy-eggs' },
            { _id: "64f1c1234567890123456797", slug: 'meat-fish' },
            { _id: "64f1c1234567890123456798", slug: 'processed-foods' }
          ];
          
          const mockCategory = mockCategories.find(cat => cat.slug === data.category);
          if (mockCategory) {
            // Use the mock category ID for development
            data.category = mockCategory._id;
            // Set category to truthy so validation passes
            category = { _id: mockCategory._id };
          }
        }
      }
      
      if (!category) {
        return { success: false, error: "Category not found" };
      }
      
      // Ensure we're using the ObjectId and set categoryId
      if (category._id) {
        data.categoryId = data.category;
        delete data.category; // Remove category and use categoryId
      }
    }

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const updatedProduct = await productRepo.updateProduct(productId, updateData, session);
    await commitTransaction(session);

    return { success: true, data: updatedProduct };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error updating product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(productId: string, vendorId: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Verify product belongs to vendor
    const product = await productRepo.getProductById(productId);
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Handle both populated and non-populated vendorId
    let productVendorId: string;
    
    if (typeof product.vendorId === 'object' && product.vendorId._id) {
      // vendorId is populated with vendor object, extract the _id
      productVendorId = product.vendorId._id.toString();
    } else {
      // vendorId is just the ObjectId reference
      productVendorId = product.vendorId.toString();
    }

    if (productVendorId !== vendorId) {
      return { success: false, error: "Unauthorized to delete this product" };
    }

    await productRepo.deleteProduct(productId);
    await commitTransaction(session);

    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error deleting product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

export async function updateProductStock(productId: string, quantity: number, operation: 'add' | 'subtract') {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const product = await productRepo.getProductById(productId);
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    let newQuantity = product.quantity;
    if (operation === 'add') {
      newQuantity += quantity;
    } else {
      newQuantity -= quantity;
      if (newQuantity < 0) {
        return { success: false, error: "Insufficient stock" };
      }
    }

    const updatedProduct = await productRepo.updateProduct(
      productId,
      { quantity: newQuantity },
      session
    );
    
    await commitTransaction(session);
    return { success: true, data: updatedProduct };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error updating product stock:", error);
    return { success: false, error: "Failed to update stock" };
  }
}

export async function getFeaturedProducts(limit: number = 10) {
  try {
    await connectDB();
    const products = await productRepo.getFeaturedProducts(limit);
    return { success: true, products };
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return { success: false, error: "Failed to fetch featured products" };
  }
}

export async function getRecentProducts(limit: number = 10) {
  try {
    await connectDB();
    const products = await productRepo.getRecentProducts(limit);
    return { success: true, products };
  } catch (error) {
    console.error("Error fetching recent products:", error);
    return { success: false, error: "Failed to fetch recent products" };
  }
}

export async function getProductsWithFilters(filters: any = {}, page: number = 1, limit: number = 10) {
  try {
    await connectDB();
    const result = await productRepo.getProductsWithFilters(filters, page, limit);
    return { success: true, products: result.products, pagination: result.pagination };
  } catch (error) {
    console.error("Error fetching products with filters:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}