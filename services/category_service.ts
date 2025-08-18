import * as categoryRepo from "@/repositories/category_repo";
import * as productRepo from "@/repositories/product_repo";
import * as userRepo from "@/repositories/user_repo";
import * as notificationService from "./notification_service";
import { connectDB } from "@/lib/db";
import { startTransaction, commitTransaction, abortTransaction } from "@/lib/db_transaction";
import { Types } from "mongoose";

export interface CreateCategoryData {
  name: string;
  description?: string;
  parentCategory?: string;
  image?: string;
  icon?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  isActive?: boolean;
  sortOrder?: number;
  commission?: number;
  attributes?: CategoryAttribute[];
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  parentCategory?: string;
  image?: string;
  icon?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  isActive?: boolean;
  sortOrder?: number;
  commission?: number;
  attributes?: CategoryAttribute[];
}

export interface CategoryAttribute {
  name: string;
  type: AttributeType;
  required: boolean;
  options?: string[];
  defaultValue?: string;
  validation?: AttributeValidation;
}

export interface AttributeValidation {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export enum AttributeType {
  TEXT = 'text',
  NUMBER = 'number',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  BOOLEAN = 'boolean',
  DATE = 'date',
  URL = 'url',
  EMAIL = 'email'
}

export async function createCategory(adminId: string, categoryData: CreateCategoryData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Validate admin user
    const admin = await userRepo.getUserById(adminId);
    if (!admin || admin.role !== 'admin') {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    // Validate category data
    const validationResult = validateCategoryData(categoryData);
    if (!validationResult.isValid) {
      return { success: false, error: validationResult.error };
    }

    // Check if category name already exists at the same level
    const existingCategory = await categoryRepo.getCategoryByName(categoryData.name, categoryData.parentCategory);
    if (existingCategory) {
      return { success: false, error: "Category name already exists at this level" };
    }

    // Validate parent category if specified
    if (categoryData.parentCategory) {
      const parentCategory = await categoryRepo.getCategoryById(categoryData.parentCategory);
      if (!parentCategory) {
        return { success: false, error: "Parent category not found" };
      }
      if (!parentCategory.isActive) {
        return { success: false, error: "Parent category is inactive" };
      }
    }

    // Generate slug if not provided
    const slug = categoryData.slug || generateSlug(categoryData.name);
    
    // Check if slug is unique
    const existingSlug = await categoryRepo.getCategoryBySlug(slug);
    if (existingSlug) {
      return { success: false, error: "Category slug already exists" };
    }

    // Determine sort order if not provided
    const sortOrder = categoryData.sortOrder || await getNextSortOrder(categoryData.parentCategory);

    // Create category
    const category = await categoryRepo.createCategory({
      name: categoryData.name,
      description: categoryData.description,
      parentCategory: categoryData.parentCategory,
      image: categoryData.image,
      icon: categoryData.icon,
      slug,
      metaTitle: categoryData.metaTitle || categoryData.name,
      metaDescription: categoryData.metaDescription || categoryData.description,
      keywords: categoryData.keywords || [],
      isActive: categoryData.isActive !== false,
      sortOrder,
      commission: categoryData.commission || 0,
      attributes: categoryData.attributes || [],
      productCount: 0,
      level: await calculateCategoryLevel(categoryData.parentCategory),
      path: await generateCategoryPath(categoryData.parentCategory, categoryData.name),
      createdBy: adminId,
      createdAt: new Date(),
      updatedAt: new Date()
    }, session);

    // Update parent category's child count
    if (categoryData.parentCategory) {
      await categoryRepo.incrementChildCount(categoryData.parentCategory, session);
    }

    await commitTransaction(session);
    return { success: true, data: category };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error creating category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function getCategoryById(categoryId: string) {
  try {
    await connectDB();
    
    const category = await categoryRepo.getCategoryById(categoryId);
    if (!category) {
      return { success: false, error: "Category not found" };
    }

    return { success: true, data: category };
  } catch (error) {
    console.error("Error fetching category:", error);
    return { success: false, error: "Failed to fetch category" };
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    await connectDB();
    
    const category = await categoryRepo.getCategoryBySlug(slug);
    if (!category) {
      return { success: false, error: "Category not found" };
    }

    return { success: true, data: category };
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    return { success: false, error: "Failed to fetch category" };
  }
}

export async function getAllCategories(includeInactive: boolean = false, parentId?: string) {
  try {
    await connectDB();
    
    const categories = await categoryRepo.getAllCategories(includeInactive, parentId);
    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function getCategoryTree(includeInactive: boolean = false) {
  try {
    await connectDB();
    
    const categories = await categoryRepo.getCategoryTree(includeInactive);
    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching category tree:", error);
    return { success: false, error: "Failed to fetch category tree" };
  }
}

export async function getTopLevelCategories(includeInactive: boolean = false) {
  try {
    await connectDB();
    
    const categories = await categoryRepo.getTopLevelCategories(includeInactive);
    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching top-level categories:", error);
    return { success: false, error: "Failed to fetch top-level categories" };
  }
}

export async function getSubcategories(parentId: string, includeInactive: boolean = false) {
  try {
    await connectDB();
    
    const parentCategory = await categoryRepo.getCategoryById(parentId);
    if (!parentCategory) {
      return { success: false, error: "Parent category not found" };
    }

    const subcategories = await categoryRepo.getSubcategories(parentId, includeInactive);
    return { success: true, data: subcategories };
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return { success: false, error: "Failed to fetch subcategories" };
  }
}

export async function updateCategory(categoryId: string, adminId: string, updateData: UpdateCategoryData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Validate admin user
    const admin = await userRepo.getUserById(adminId);
    if (!admin || admin.role !== 'admin') {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    const category = await categoryRepo.getCategoryById(categoryId);
    if (!category) {
      return { success: false, error: "Category not found" };
    }

    // Validate updated data
    if (updateData.name || updateData.parentCategory) {
      const validationResult = validateCategoryData({
        name: updateData.name || category.name,
        parentCategory: updateData.parentCategory
      } as CreateCategoryData);
      if (!validationResult.isValid) {
        return { success: false, error: validationResult.error };
      }
    }

    // Check if new name conflicts with existing categories
    if (updateData.name && updateData.name !== category.name) {
      const existingCategory = await categoryRepo.getCategoryByName(
        updateData.name, 
        updateData.parentCategory || category.parentCategory
      );
      if (existingCategory && existingCategory._id.toString() !== categoryId) {
        return { success: false, error: "Category name already exists at this level" };
      }
    }

    // Validate parent category change
    if (updateData.parentCategory !== undefined && updateData.parentCategory !== category.parentCategory?.toString()) {
      if (updateData.parentCategory) {
        const newParent = await categoryRepo.getCategoryById(updateData.parentCategory);
        if (!newParent) {
          return { success: false, error: "New parent category not found" };
        }
        if (!newParent.isActive) {
          return { success: false, error: "New parent category is inactive" };
        }
        // Prevent circular references
        if (await isCircularReference(categoryId, updateData.parentCategory)) {
          return { success: false, error: "Cannot create circular reference" };
        }
      }

      // Update child counts
      if (category.parentCategory) {
        await categoryRepo.decrementChildCount(category.parentCategory.toString(), session);
      }
      if (updateData.parentCategory) {
        await categoryRepo.incrementChildCount(updateData.parentCategory, session);
      }
    }

    // Generate new slug if name changed
    let slug = updateData.slug;
    if (updateData.name && updateData.name !== category.name && !slug) {
      slug = generateSlug(updateData.name);
    }

    // Check slug uniqueness
    if (slug && slug !== category.slug) {
      const existingSlug = await categoryRepo.getCategoryBySlug(slug);
      if (existingSlug && existingSlug._id.toString() !== categoryId) {
        return { success: false, error: "Category slug already exists" };
      }
    }

    // Calculate new level and path if parent changed
    let level = category.level;
    let path = category.path;
    if (updateData.parentCategory !== undefined && updateData.parentCategory !== category.parentCategory?.toString()) {
      level = await calculateCategoryLevel(updateData.parentCategory);
      path = await generateCategoryPath(updateData.parentCategory, updateData.name || category.name);
    }

    // Update category
    const updatedCategory = await categoryRepo.updateCategory(categoryId, {
      ...updateData,
      slug,
      level,
      path,
      updatedAt: new Date()
    }, session);

    await commitTransaction(session);
    return { success: true, data: updatedCategory };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error updating category:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(categoryId: string, adminId: string, force: boolean = false) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Validate admin user
    const admin = await userRepo.getUserById(adminId);
    if (!admin || admin.role !== 'admin') {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    const category = await categoryRepo.getCategoryById(categoryId);
    if (!category) {
      return { success: false, error: "Category not found" };
    }

    // Check if category has products
    if (category.productCount > 0 && !force) {
      return { success: false, error: "Cannot delete category with products. Use force=true to proceed." };
    }

    // Check if category has subcategories
    const subcategories = await categoryRepo.getSubcategories(categoryId, true);
    if (subcategories.length > 0 && !force) {
      return { success: false, error: "Cannot delete category with subcategories. Use force=true to proceed." };
    }

    if (force) {
      // Move products to parent category or uncategorized
      if (category.productCount > 0) {
        const newCategoryId = category.parentCategory || null;
        await productRepo.updateProductsCategory(categoryId, newCategoryId, session);
      }

      // Move subcategories to parent category
      if (subcategories.length > 0) {
        for (const subcategory of subcategories) {
          await categoryRepo.updateCategory(subcategory._id.toString(), {
            parentCategory: category.parentCategory,
            level: category.level,
            path: await generateCategoryPath(category.parentCategory, subcategory.name),
            updatedAt: new Date()
          }, session);
        }
      }
    }

    // Update parent category's child count
    if (category.parentCategory) {
      await categoryRepo.decrementChildCount(category.parentCategory.toString(), session);
    }

    // Soft delete the category
    await categoryRepo.updateCategory(categoryId, {
      isActive: false,
      deletedAt: new Date(),
      deletedBy: adminId,
      updatedAt: new Date()
    }, session);

    await commitTransaction(session);
    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error deleting category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

export async function reorderCategories(adminId: string, categoryOrders: { categoryId: string; sortOrder: number }[]) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Validate admin user
    const admin = await userRepo.getUserById(adminId);
    if (!admin || admin.role !== 'admin') {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    // Update sort orders
    for (const { categoryId, sortOrder } of categoryOrders) {
      await categoryRepo.updateCategory(categoryId, {
        sortOrder,
        updatedAt: new Date()
      }, session);
    }

    await commitTransaction(session);
    return { success: true, message: "Categories reordered successfully" };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error reordering categories:", error);
    return { success: false, error: "Failed to reorder categories" };
  }
}

export async function searchCategories(query: string, filters?: any) {
  try {
    await connectDB();
    
    const categories = await categoryRepo.searchCategories(query, filters);
    return { success: true, data: categories };
  } catch (error) {
    console.error("Error searching categories:", error);
    return { success: false, error: "Failed to search categories" };
  }
}

export async function getCategoryStats(adminId?: string) {
  try {
    await connectDB();
    
    // Validate admin access for detailed stats
    if (adminId) {
      const admin = await userRepo.getUserById(adminId);
      if (!admin || admin.role !== 'admin') {
        return { success: false, error: "Unauthorized - Admin access required" };
      }
    }

    const stats = await categoryRepo.getCategoryStats();
    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching category stats:", error);
    return { success: false, error: "Failed to fetch category statistics" };
  }
}

export async function updateProductCount(categoryId: string, increment: number = 1) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    await categoryRepo.updateProductCount(categoryId, increment, session);
    
    // Update parent categories' product counts
    const category = await categoryRepo.getCategoryById(categoryId);
    if (category?.parentCategory) {
      await updateProductCount(category.parentCategory.toString(), increment);
    }

    await commitTransaction(session);
    return { success: true };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error updating product count:", error);
    return { success: false, error: "Failed to update product count" };
  }
}

export async function getFeaturedCategories(limit: number = 10) {
  try {
    await connectDB();
    
    const categories = await categoryRepo.getFeaturedCategories(limit);
    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching featured categories:", error);
    return { success: false, error: "Failed to fetch featured categories" };
  }
}

// Helper functions
function validateCategoryData(data: CreateCategoryData): { isValid: boolean; error?: string } {
  if (!data.name || data.name.trim().length === 0) {
    return { isValid: false, error: "Category name is required" };
  }
  
  if (data.name.length > 100) {
    return { isValid: false, error: "Category name must be less than 100 characters" };
  }
  
  if (data.description && data.description.length > 1000) {
    return { isValid: false, error: "Category description must be less than 1000 characters" };
  }
  
  if (data.commission && (data.commission < 0 || data.commission > 100)) {
    return { isValid: false, error: "Commission must be between 0 and 100" };
  }
  
  return { isValid: true };
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function getNextSortOrder(parentId?: string): Promise<number> {
  try {
    const categories = await categoryRepo.getAllCategories(true, parentId);
    const maxOrder = Math.max(...categories.map(c => c.sortOrder || 0), 0);
    return maxOrder + 1;
  } catch (error) {
    return 1;
  }
}

async function calculateCategoryLevel(parentId?: string): Promise<number> {
  if (!parentId) return 0;
  
  try {
    const parent = await categoryRepo.getCategoryById(parentId);
    return parent ? parent.level + 1 : 0;
  } catch (error) {
    return 0;
  }
}

async function generateCategoryPath(parentId?: string, categoryName?: string): Promise<string> {
  if (!parentId) return categoryName || '';
  
  try {
    const parent = await categoryRepo.getCategoryById(parentId);
    const parentPath = parent?.path || parent?.name || '';
    return parentPath ? `${parentPath} > ${categoryName}` : categoryName || '';
  } catch (error) {
    return categoryName || '';
  }
}

async function isCircularReference(categoryId: string, newParentId: string): Promise<boolean> {
  if (categoryId === newParentId) return true;
  
  try {
    let currentParent = await categoryRepo.getCategoryById(newParentId);
    
    while (currentParent) {
      if (currentParent._id.toString() === categoryId) {
        return true;
      }
      
      if (currentParent.parentCategory) {
        currentParent = await categoryRepo.getCategoryById(currentParent.parentCategory.toString());
      } else {
        break;
      }
    }
    
    return false;
  } catch (error) {
    return false;
  }
}