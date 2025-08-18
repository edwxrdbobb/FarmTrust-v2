//@ts-check
import Category from "@/models/category_model";

interface QueryOptions {
  sort?: any;
  limit?: number;
  skip?: number;
}

/**
 * Creates a new category
 * @param {Object} data - The data for the category
 * @param {Object} [options] - The options for the save method
 * @returns {Promise<Category>} The created category
 */
export async function createCategory(data: any, options: any = {}) {
  const category = new Category(data);
  return await category.save(options);
}

/**
 * Gets a category by its id
 * @param {string} id - The id of the category
 * @returns {Promise<Category>} The category
 */
export async function getCategoryById(id: string) {
  return await Category.findById(id);
}

/**
 * Gets a category by slug
 * @param {string} slug - The slug of the category
 * @returns {Promise<Category>} The category
 */
export async function getCategoryBySlug(slug: string) {
  return await Category.findOne({ slug });
}

/**
 * Gets a category by name
 * @param {string} name - The name of the category
 * @returns {Promise<Category>} The category
 */
export async function getCategoryByName(name: string) {
  return await Category.findOne({ name });
}

/**
 * Gets all categories with optional filtering
 * @param {Object} [filter] - The filter criteria
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Category[]>} Array of categories
 */
export async function getCategories(filter: any = {}, options: QueryOptions = {}) {
  let query = Category.find(filter);
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets active categories
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Category[]>} Array of active categories
 */
export async function getActiveCategories(options: QueryOptions = {}) {
  return await getCategories({ isActive: true }, options);
}

/**
 * Updates a category
 * @param {string} id - The id of the category
 * @param {Object} data - The data to update the category with
 * @param {Object} [options] - The options for the update method
 * @returns {Promise<Category>} The updated category
 */
export async function updateCategory(id: string, data: any, options: any = {}) {
  return await Category.findByIdAndUpdate(id, data, { new: true, ...options });
}

/**
 * Updates category by slug
 * @param {string} slug - The slug of the category
 * @param {Object} data - The data to update the category with
 * @param {Object} [options] - The options for the update method
 * @returns {Promise<Category>} The updated category
 */
export async function updateCategoryBySlug(slug: string, data: any, options: any = {}) {
  return await Category.findOneAndUpdate({ slug }, data, { new: true, ...options });
}

/**
 * Deletes a category by its id
 * @param {string} id - The id of the category
 * @returns {Promise<Category>} The deleted category
 */
export async function deleteCategory(id: string) {
  return await Category.findByIdAndDelete(id);
}

/**
 * Counts categories with optional filtering
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<number>} The count of categories
 */
export async function countCategories(filter: any = {}) {
  return await Category.countDocuments(filter);
}

/**
 * Gets all categories with optional filtering for active/inactive
 * @param {boolean} includeInactive - Whether to include inactive categories
 * @param {string} [parentId] - Optional parent ID to filter by
 * @returns {Promise<Category[]>} Array of categories
 */
export async function getAllCategories(includeInactive: boolean = false, parentId?: string) {
  const filter: any = {};
  
  if (!includeInactive) {
    filter.active = true;
  }
  
  if (parentId) {
    filter.parentId = parentId;
  }
  
  filter.deleted_at = null;
  
  return await Category.find(filter).sort({ sortOrder: 1, name: 1 });
}

/**
 * Gets subcategories for a parent category
 * @param {string} parentId - The parent category ID
 * @param {boolean} includeInactive - Whether to include inactive categories
 * @returns {Promise<Category[]>} Array of subcategories
 */
export async function getSubcategories(parentId: string, includeInactive: boolean = false) {
  const filter: any = { parentId };
  
  if (!includeInactive) {
    filter.active = true;
  }
  
  filter.deleted_at = null;
  
  return await Category.find(filter).sort({ sortOrder: 1, name: 1 });
}

/**
 * Gets top-level categories (no parent)
 * @param {boolean} includeInactive - Whether to include inactive categories
 * @returns {Promise<Category[]>} Array of top-level categories
 */
export async function getTopLevelCategories(includeInactive: boolean = false) {
  const filter: any = { 
    $or: [
      { parentId: null },
      { parentId: { $exists: false } }
    ]
  };
  
  if (!includeInactive) {
    filter.active = true;
  }
  
  filter.deleted_at = null;
  
  return await Category.find(filter).sort({ sortOrder: 1, name: 1 });
}

/**
 * Gets category tree structure
 * @param {boolean} includeInactive - Whether to include inactive categories
 * @returns {Promise<Category[]>} Array of categories with nested structure
 */
export async function getCategoryTree(includeInactive: boolean = false) {
  // For now, just return all categories - tree building can be done in service layer
  return await getAllCategories(includeInactive);
}

/**
 * Gets featured categories
 * @param {number} limit - Maximum number of categories to return
 * @returns {Promise<Category[]>} Array of featured categories
 */
export async function getFeaturedCategories(limit: number = 10) {
  return await Category.find({ 
    active: true, 
    deleted_at: null 
  })
  .sort({ sortOrder: 1, name: 1 })
  .limit(limit);
}

/**
 * Updates product count for a category
 * @param {string} categoryId - The category ID
 * @param {number} increment - The increment value (can be negative)
 * @param {Object} session - The database session for transactions
 * @returns {Promise<Category>} The updated category
 */
export async function updateProductCount(categoryId: string, increment: number, session?: any) {
  return await Category.findByIdAndUpdate(
    categoryId,
    { $inc: { productCount: increment } },
    { new: true, session }
  );
}

/**
 * Increments child count for a category
 * @param {string} categoryId - The category ID
 * @param {Object} session - The database session for transactions
 * @returns {Promise<Category>} The updated category
 */
export async function incrementChildCount(categoryId: string, session?: any) {
  return await Category.findByIdAndUpdate(
    categoryId,
    { $inc: { childCount: 1 } },
    { new: true, session }
  );
}

/**
 * Decrements child count for a category
 * @param {string} categoryId - The category ID
 * @param {Object} session - The database session for transactions
 * @returns {Promise<Category>} The updated category
 */
export async function decrementChildCount(categoryId: string, session?: any) {
  return await Category.findByIdAndUpdate(
    categoryId,
    { $inc: { childCount: -1 } },
    { new: true, session }
  );
}

/**
 * Searches categories by query
 * @param {string} query - The search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Category[]>} Array of matching categories
 */
export async function searchCategories(query: string, filters?: any) {
  const searchFilter: any = {
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ],
    active: true,
    deleted_at: null
  };
  
  if (filters) {
    Object.assign(searchFilter, filters);
  }
  
  return await Category.find(searchFilter).sort({ name: 1 });
}

/**
 * Gets category statistics
 * @returns {Promise<Object>} Category statistics
 */
export async function getCategoryStats() {
  const [total, active, inactive] = await Promise.all([
    Category.countDocuments({ deleted_at: null }),
    Category.countDocuments({ active: true, deleted_at: null }),
    Category.countDocuments({ active: false, deleted_at: null })
  ]);
  
  return {
    total,
    active,
    inactive
  };
}