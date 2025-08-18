export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "disputed"

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Order {
  id: string
  buyerId: string
  items: OrderItem[]
  status: OrderStatus
  totalAmount: number
  shippingAddress: string
  paymentMethod: string
  paymentStatus: "pending" | "paid" | "refunded"
  escrowId: string
  createdAt: string
  updatedAt: string
}

export interface VendorOrder extends Order {
  buyer: {
    id: string
    name: string
    email: string
  }
}

export interface BuyerOrder extends Order {
  vendors: {
    id: string
    farmName: string
  }[]
}
