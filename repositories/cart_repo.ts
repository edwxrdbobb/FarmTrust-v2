//@ts-check
import CartItem from "@/models/cart_model";

interface QueryOptions {
  sort?: any;
  limit?: number;
  skip?: number;
}

/**
 * Creates a new cart item
 * @param {Object} data - The data for the cart item
 * @param {Object} [options] - The options for the save method
 * @returns {Promise<CartItem>} The created cart item
 */
export async function createCartItem(data: any, options: any = {}) {
  const cartItem = new CartItem(data);
  return await cartItem.save(options);
}

/**
 * Gets a cart item by its id
 * @param {string} id - The id of the cart item
 * @returns {Promise<CartItem>} The cart item with populated product data
 */
export async function getCartItemById(id: string) {
  return await CartItem.findById(id)
    .populate("userId")
    .populate("productId");
}

/**
 * Gets cart items by user id
 * @param {string} userId - The user id
 * @returns {Promise<CartItem[]>} Array of cart items for the user
 */
export async function getCartItemsByUserId(userId: string) {
  return await CartItem.find({ userId })
    .populate("userId")
    .populate("productId")
    .sort({ createdAt: -1 });
}

/**
 * Gets a specific cart item by user and product
 * @param {string} userId - The user id
 * @param {string} productId - The product id
 * @returns {Promise<CartItem>} The cart item
 */
export async function getCartItemByUserAndProduct(userId: string, productId: string) {
  return await CartItem.findOne({ userId, productId })
    .populate("userId")
    .populate("productId");
}

/**
 * Gets all cart items with optional filtering
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<CartItem[]>} Array of cart items with populated data
 */
export async function getCartItems(filter: any = {}) {
  return await CartItem.find(filter)
    .populate("userId")
    .populate("productId")
    .sort({ createdAt: -1 });
}

/**
 * Updates a cart item
 * @param {string} id - The id of the cart item
 * @param {Object} data - The data to update the cart item with
 * @param {Object} [options] - The options for the update method
 * @returns {Promise<CartItem>} The updated cart item
 */
export async function updateCartItem(id: string, data: any, options: any = {}) {
  return await CartItem.findByIdAndUpdate(id, data, { new: true, ...options })
    .populate("userId")
    .populate("productId");
}

/**
 * Updates cart item quantity
 * @param {string} id - The id of the cart item
 * @param {number} quantity - The new quantity
 * @returns {Promise<CartItem>} The updated cart item
 */
export async function updateCartItemQuantity(id: string, quantity: number) {
  return await updateCartItem(id, { quantity });
}

/**
 * Updates or creates cart item (upsert)
 * @param {string} userId - The user id
 * @param {string} productId - The product id
 * @param {number} quantity - The quantity
 * @param {number} price - The price
 * @returns {Promise<CartItem>} The cart item
 */
export async function upsertCartItem(userId: string, productId: string, quantity: number, price: number) {
  return await CartItem.findOneAndUpdate(
    { userId, productId },
    { quantity, price, updatedAt: new Date() },
    { new: true, upsert: true }
  ).populate("userId").populate("productId");
}

/**
 * Deletes a cart item by its id
 * @param {string} id - The id of the cart item
 * @returns {Promise<CartItem>} The deleted cart item
 */
export async function deleteCartItem(id: string) {
  return await CartItem.findByIdAndDelete(id);
}

/**
 * Deletes cart item by user and product
 * @param {string} userId - The user id
 * @param {string} productId - The product id
 * @returns {Promise<CartItem>} The deleted cart item
 */
export async function deleteCartItemByUserAndProduct(userId: string, productId: string) {
  return await CartItem.findOneAndDelete({ userId, productId });
}

/**
 * Clears all cart items for a user
 * @param {string} userId - The user id
 * @returns {Promise<Object>} The delete result
 */
export async function clearUserCart(userId: string) {
  return await CartItem.deleteMany({ userId });
}

/**
 * Counts cart items for a user
 * @param {string} userId - The user id
 * @returns {Promise<number>} The count of cart items
 */
export async function countCartItems(userId: string) {
  return await CartItem.countDocuments({ userId });
}

/**
 * Gets cart total for a user
 * @param {string} userId - The user id
 * @returns {Promise<Object>} Cart total information
 */
export async function getCartTotal(userId: string) {
  const result = await CartItem.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: null,
        totalItems: { $sum: "$quantity" },
        totalAmount: { $sum: { $multiply: ["$quantity", "$price"] } }
      }
    }
  ]);
  
  return result[0] || { totalItems: 0, totalAmount: 0 };
}

/**
 * Gets cart by user id (returns cart-like structure)
 * @param {string} userId - The user id
 * @returns {Promise<Object>} Cart object with items array
 */
export async function getCartByUserId(userId: string) {
  const cartItems = await getCartItemsByUserId(userId);
  
  if (cartItems.length === 0) {
    return null;
  }
  
  const totalAmount = cartItems.reduce(
    (total: number, item: any) => total + (item.price * item.quantity),
    0
  );
  
  return {
    _id: `cart_${userId}`,
    user: userId,
    items: cartItems,
    totalAmount,
    createdAt: cartItems[0]?.createdAt || new Date(),
    updatedAt: new Date()
  };
}

/**
 * Updates cart (this is a virtual operation since we store individual cart items)
 * @param {string} cartId - The cart id (ignored, uses userId from cart data)
 * @param {Object} cartData - The cart data
 * @returns {Promise<Object>} Updated cart
 */
export async function updateCart(cartId: string, cartData: any) {
  // This is a no-op since we manage individual cart items
  // The cart structure is virtual and reconstructed on each request
  return cartData;
}