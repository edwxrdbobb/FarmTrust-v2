import * as cartRepo from "@/repositories/cart_repo";
import * as productRepo from "@/repositories/product_repo";
import * as userRepo from "@/repositories/user_repo";
import { connectDB } from "@/lib/db";
import { startTransaction, commitTransaction, abortTransaction } from "@/lib/db_transaction";
import { Types } from "mongoose";

export interface CartItem {
  product: string;
  quantity: number;
  price: number;
  addedAt: Date;
}

export interface AddToCartData {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

export async function getCart(userId: string) {
  try {
    await connectDB();
    
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const cartItems = await cartRepo.getCartItemsByUserId(userId);
    
    // Populate product details for each cart item
    const populatedItems = await Promise.all(
      cartItems.map(async (item: any) => {
        const product = await productRepo.getProductById(item.productId);
        return {
          ...item.toObject(),
          product: product ? {
            _id: product._id,
            name: product.name,
            images: product.images,
            unit: product.unit,
            vendor: product.vendor
          } : null
        };
      })
    );
    
    // Calculate total
    const totalAmount = populatedItems.reduce(
      (total: number, item: any) => total + (item.price * item.quantity),
      0
    );
    
    // Transform to expected format
    const cart = {
      user: userId,
      items: populatedItems,
      totalAmount,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return { success: true, data: cart };
  } catch (error) {
    console.error("Error fetching cart:", error);
    return { success: false, error: "Failed to fetch cart" };
  }
}

export async function addToCart(userId: string, data: AddToCartData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Validate user
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Validate product
    const product = await productRepo.getProductById(data.productId);
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    if (!product.available) {
      return { success: false, error: "Product is not available" };
    }

    if (product.quantity < data.quantity) {
      return { success: false, error: "Insufficient stock available" };
    }

    if (data.quantity <= 0) {
      return { success: false, error: "Quantity must be greater than 0" };
    }

    // Check if product already in cart
    const existingItem = await cartRepo.getCartItemByUserAndProduct(userId, data.productId);

    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + data.quantity;
      
      if (product.quantity < newQuantity) {
        return { success: false, error: "Not enough stock for requested quantity" };
      }

      const updatedItem = await cartRepo.updateCartItem(existingItem._id, {
        quantity: newQuantity,
        price: product.price // Update to current price
      }, { session });
      
      await commitTransaction(session);
      
      // Return updated cart
      const cartItems = await cartRepo.getCartItemsByUserId(userId);
      const totalAmount = cartItems.reduce(
        (total: number, item: any) => total + (item.price * item.quantity),
        0
      );
      
      return { 
        success: true, 
        data: {
          user: userId,
          items: cartItems,
          totalAmount,
          updatedAt: new Date()
        }
      };
    } else {
      // Add new item
      const newItem = await cartRepo.createCartItem({
        userId: userId,
        productId: data.productId,
        quantity: data.quantity,
        price: product.price
      }, { session });
      
      await commitTransaction(session);
      
      // Return updated cart
      const cartItems = await cartRepo.getCartItemsByUserId(userId);
      const totalAmount = cartItems.reduce(
        (total: number, item: any) => total + (item.price * item.quantity),
        0
      );
      
      return { 
        success: true, 
        data: {
          user: userId,
          items: cartItems,
          totalAmount,
          updatedAt: new Date()
        }
      };
    }
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error adding to cart:", error);
    return { success: false, error: "Failed to add item to cart" };
  }
}

export async function updateCartItem(userId: string, productId: string, data: UpdateCartItemData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Validate product
    const product = await productRepo.getProductById(productId);
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    if (data.quantity <= 0) {
      return { success: false, error: "Quantity must be greater than 0" };
    }

    if (product.quantity < data.quantity) {
      return { success: false, error: "Insufficient stock available" };
    }

    // Find cart item
    const cartItem = await cartRepo.getCartItemByUserAndProduct(userId, productId);
    if (!cartItem) {
      return { success: false, error: "Item not found in cart" };
    }

    // Update item
    const updatedItem = await cartRepo.updateCartItem(cartItem._id, {
      quantity: data.quantity,
      price: product.price // Update to current price
    }, { session });

    await commitTransaction(session);

    // Return updated cart
    const cartItems = await cartRepo.getCartItemsByUserId(userId);
    const totalAmount = cartItems.reduce(
      (total: number, item: any) => total + (item.price * item.quantity),
      0
    );

    return { 
      success: true, 
      data: {
        user: userId,
        items: cartItems,
        totalAmount,
        updatedAt: new Date()
      }
    };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error updating cart item:", error);
    return { success: false, error: "Failed to update cart item" };
  }
}

export async function removeFromCart(userId: string, productId: string) {
  let session;
  try {
    console.log("removeFromCart - Starting:", { userId, productId });
    
    await connectDB();
    session = await startTransaction();

    console.log("removeFromCart - DB connected, transaction started");
    
    // Check if item exists before deletion
    const existingItem = await cartRepo.getCartItemByUserAndProduct(userId, productId);
    console.log("removeFromCart - Existing item check:", existingItem ? "Found" : "Not found");
    
    if (!existingItem) {
      await commitTransaction(session);
      console.log("removeFromCart - Item not found in cart, returning success anyway");
      
      // Return updated cart even if item wasn't found
      const cartItems = await cartRepo.getCartItemsByUserId(userId);
      const totalAmount = cartItems.reduce(
        (total: number, item: any) => total + (item.price * item.quantity),
        0
      );
      
      return { 
        success: true, 
        data: {
          user: userId,
          items: cartItems,
          totalAmount,
          updatedAt: new Date()
        }
      };
    }

    // Remove item from cart
    console.log("removeFromCart - Deleting cart item");
    const result = await cartRepo.deleteCartItemByUserAndProduct(userId, productId);
    console.log("removeFromCart - Delete result:", result ? "Success" : "Failed");
    
    await commitTransaction(session);
    console.log("removeFromCart - Transaction committed");

    // Return updated cart
    const cartItems = await cartRepo.getCartItemsByUserId(userId);
    const totalAmount = cartItems.reduce(
      (total: number, item: any) => total + (item.price * item.quantity),
      0
    );

    console.log("removeFromCart - Returning updated cart:", { itemCount: cartItems.length, totalAmount });
    
    return { 
      success: true, 
      data: {
        user: userId,
        items: cartItems,
        totalAmount,
        updatedAt: new Date()
      }
    };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error removing from cart:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack available');
    return { success: false, error: "Failed to remove item from cart" };
  }
}

export async function clearCart(userId: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Clear all cart items for user
    await cartRepo.clearUserCart(userId);
    
    await commitTransaction(session);
    
    return { 
      success: true, 
      data: {
        user: userId,
        items: [],
        totalAmount: 0,
        updatedAt: new Date()
      }
    };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error clearing cart:", error);
    return { success: false, error: "Failed to clear cart" };
  }
}

export async function validateCartItems(userId: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();
    
    const cart = await cartRepo.getCartByUserId(userId);
    if (!cart || cart.items.length === 0) {
      await commitTransaction(session);
      return { success: true, data: { valid: true, issues: [] } };
    }

    const issues = [];
    let hasChanges = false;

    for (let i = cart.items.length - 1; i >= 0; i--) {
      const item = cart.items[i];
      const product = await productRepo.getProductById(item.product.toString());

      if (!product) {
        issues.push({
          type: 'product_not_found',
          productId: item.product,
          message: 'Product no longer available'
        });
        cart.items.splice(i, 1);
        hasChanges = true;
        continue;
      }

      if (!product.isActive) {
        issues.push({
          type: 'product_inactive',
          productId: item.product,
          productName: product.name,
          message: 'Product is no longer active'
        });
        cart.items.splice(i, 1);
        hasChanges = true;
        continue;
      }

      if (product.quantity < item.quantity) {
        issues.push({
          type: 'insufficient_stock',
          productId: item.product,
          productName: product.name,
          requestedQuantity: item.quantity,
          availableStock: product.quantity,
          message: `Only ${product.quantity} items available`
        });
        
        if (product.quantity > 0) {
          cart.items[i].quantity = product.quantity;
          hasChanges = true;
        } else {
          cart.items.splice(i, 1);
          hasChanges = true;
        }
      }

      // Update price if changed
      if (item.price !== product.price) {
        issues.push({
          type: 'price_changed',
          productId: item.product,
          productName: product.name,
          oldPrice: item.price,
          newPrice: product.price,
          message: 'Product price has changed'
        });
        cart.items[i].price = product.price;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      // Recalculate total
      cart.totalAmount = cart.items.reduce(
        (total: number, item: any) => total + (item.price * item.quantity),
        0
      );
      cart.updatedAt = new Date();
      
      await cartRepo.updateCart(cart._id, cart);
    }

    await commitTransaction(session);

    return {
      success: true,
      data: {
        valid: issues.length === 0,
        issues,
        updatedCart: hasChanges ? cart : null
      }
    };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error validating cart:", error);
    return { success: false, error: "Failed to validate cart" };
  }
}

export async function getCartItemCount(userId: string) {
  try {
    await connectDB();
    
    const cart = await cartRepo.getCartByUserId(userId);
    if (!cart) {
      return { success: true, data: { count: 0 } };
    }

    const count = cart.items.reduce((total: number, item: any) => total + item.quantity, 0);
    return { success: true, data: { count } };
  } catch (error) {
    console.error("Error getting cart item count:", error);
    return { success: false, error: "Failed to get cart item count" };
  }
}