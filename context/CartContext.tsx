"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuthContext } from "./AuthContext"

type CartItem = {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  unit: string
  vendor: string
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: number
  loading: boolean
  fetchCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuthContext()

  // Calculate total price of items in cart
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  // Fetch cart from API
  const fetchCart = async () => {
    if (!user) {
      // Load from localStorage for non-authenticated users
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart))
        } catch (error) {
          console.error("Failed to parse cart from localStorage", error)
        }
      }
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/cart", { method: "GET" })
      if (res.ok) {
        const data = await res.json()
        if (data.cart && data.cart.items) {
          // Transform backend cart items to frontend format
          const transformedItems: CartItem[] = data.cart.items.map((item: any) => {
            const product = item.product;
            const vendorName = product?.vendor?.business_name || 
              `${product?.vendor?.first_name || ''} ${product?.vendor?.last_name || ''}`.trim() || 
              'Unknown Vendor';
            
            // Log the item structure to debug only if needed
            // console.log("Backend cart item:", item);
            
            // Ensure we have a valid productId - check multiple possible fields
            const productId = item.productId || item.product?._id || item.product?.id || item.product;
            
            if (!productId) {
              console.error("No productId found for cart item:", item);
            }
            
            return {
              id: `${productId}_default`,
              productId: productId,
              name: product?.name || 'Product',
              price: item.price || 0,
              quantity: item.quantity,
              image: product?.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg',
              unit: product?.unit || 'kg',
              vendor: vendorName
            }
          }).filter(item => item.productId) // Filter out items without productId
          setItems(transformedItems)
        } else {
          // Empty cart
          setItems([])
        }
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle cart synchronization on login/logout
  useEffect(() => {
    const syncAndLoadCart = async () => {
      if (user) {
        // User just logged in - sync localStorage cart with server
        const localCart = localStorage.getItem("cart")
        if (localCart) {
          try {
            const localItems: CartItem[] = JSON.parse(localCart)
            
            // Sync local items to server cart
            for (const item of localItems) {
              try {
                const res = await fetch("/api/cart", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    productId: item.productId,
                    quantity: item.quantity
                  })
                })
                
                if (!res.ok) {
                  console.error("Failed to sync cart item:", item.name)
                }
              } catch (error) {
                console.error("Failed to sync cart item:", error)
              }
            }
            
            // Clear localStorage after sync
            localStorage.removeItem("cart")
          } catch (error) {
            console.error("Failed to parse local cart:", error)
          }
        }
        
        // Load server cart
        await fetchCart()
      } else {
        // User logged out - load from localStorage
        await fetchCart()
      }
    }
    
    syncAndLoadCart()
  }, [user])

  // Save to localStorage for non-authenticated users
  useEffect(() => {
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, user])

  const addItem = async (item: CartItem) => {
    if (!user) {
      // For non-authenticated users, use localStorage
      setItems((prevItems) => {
        const existingItem = prevItems.find((i) => i.id === item.id)
        if (existingItem) {
          return prevItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i))
        }
        return [...prevItems, item]
      })
      return
    }

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.productId,
          quantity: item.quantity
        })
      })
      
      if (res.ok) {
        await fetchCart() // Refresh cart from server
      } else {
        const errorData = await res.text()
        console.error("Failed to add item to cart:", res.status, errorData)
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error)
    }
  }

  const removeItem = async (id: string) => {
    const item = items.find(i => i.id === id)
    if (!item) {
      console.error("Item not found in cart:", id)
      return
    }

    if (!user) {
      // For non-authenticated users, use localStorage
      setItems((prevItems) => prevItems.filter((item) => item.id !== id))
      return
    }

    // Add validation for productId
    if (!item.productId) {
      console.error("ProductId not found for cart item:", item)
      return
    }

    console.log("Attempting to remove item:", { id, productId: item.productId, item })

    try {
      const res = await fetch(`/api/cart?productId=${encodeURIComponent(item.productId)}`, {
        method: "DELETE"
      })
      
      if (res.ok) {
        await fetchCart() // Refresh cart from server
      } else {
        const errorData = await res.text()
        console.error("Failed to remove item from cart:", {
          status: res.status,
          statusText: res.statusText,
          errorData,
          item: { id, productId: item.productId }
        })
        // Still try to show the error response if it's JSON
        try {
          const errorJson = JSON.parse(errorData)
          console.error("Error JSON:", errorJson)
        } catch {
          // errorData is not JSON, already logged above
        }
      }
    } catch (error) {
      console.error("Network error removing item from cart:", error)
    }
  }

  const updateQuantity = async (id: string, quantity: number) => {
    const item = items.find(i => i.id === id)
    if (!item) return

    if (!user) {
      // For non-authenticated users, use localStorage
      setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
      return
    }

    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.productId,
          quantity
        })
      })
      
      if (res.ok) {
        await fetchCart() // Refresh cart from server
      } else {
        const errorData = await res.text()
        console.error("Failed to update cart quantity:", res.status, errorData)
      }
    } catch (error) {
      console.error("Failed to update cart quantity:", error)
    }
  }

  const clearCart = async () => {
    if (!user) {
      // For non-authenticated users, use localStorage
      setItems([])
      return
    }

    try {
      const res = await fetch("/api/cart/clear", {
        method: "DELETE"
      })
      
      if (res.ok) {
        setItems([])
      } else {
        console.error("Failed to clear cart")
      }
    } catch (error) {
      console.error("Failed to clear cart:", error)
    }
  }

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, loading, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCartContext must be used within a CartProvider")
  }
  return context
}
