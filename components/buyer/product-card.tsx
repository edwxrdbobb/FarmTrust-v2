"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { useCartContext } from "@/context/CartContext"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"

interface ProductCardProps {
  product: {
    _id: string
    name: string
    description: string
    price: number
    unit: string
    quantity: number
    images: string[]
    category: string
    featured: boolean
    status: string
    organic: boolean
    location: string
    harvestDate?: string
    created_at: string
    updated_at: string
    vendor?: {
      _id: string;
      first_name: string;
      last_name: string;
      business_name?: string;
    };
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartContext();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const vendorName = product.vendor?.business_name || 
    `${product.vendor?.first_name} ${product.vendor?.last_name}` || 
    "Unknown Vendor";

  const handleAddToCart = async () => {
    if (product.quantity === 0) return;
    
    setIsAddingToCart(true);
    
    try {
      const cartItem = {
        id: `${product._id}_default`, // Use consistent ID format
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg",
        unit: product.unit,
        vendor: vendorName,
      };
      
      await addItem(cartItem);
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      toast({
        title: "Failed to add to cart",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg">
      <Link href={`/products/${product._id}`}>
        <div className="h-48 overflow-hidden relative">
          <img
            src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {product.featured && (
            <Badge className="absolute top-2 left-2 bg-[#F5C451] text-gray-800">
              Featured
            </Badge>
          )}
          {product.organic && (
            <Badge className="absolute top-2 right-2 bg-green-500 text-white">
              Organic
            </Badge>
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/products/${product._id}`}>
            <h3 className="text-lg font-semibold text-gray-800 hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>
        <p className="text-sm text-gray-500 mb-2 line-clamp-1">{vendorName}</p>
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-bold">
              Le {product.price.toLocaleString()}/{product.unit}
            </span>
            <p className="text-xs text-gray-500">
              {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
            </p>
          </div>
          <Button 
            size="sm" 
            className="rounded-xl"
            disabled={product.quantity === 0 || isAddingToCart}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {isAddingToCart ? "Adding..." : "Add"}
          </Button>
        </div>
      </div>
    </div>
  )
}
