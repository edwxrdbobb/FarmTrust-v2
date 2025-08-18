export interface Product {
  id: string
  vendorId: string
  name: string
  description: string
  price: number
  quantity: number
  unit: string
  category: string
  images: string[]
  available: boolean
  featured: boolean
  organic: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductWithVendor extends Product {
  vendor: {
    id: string
    farmName: string
    rating: number
    verified: boolean
  }
}

export type ProductCategory =
  | "vegetables"
  | "fruits"
  | "dairy"
  | "meat"
  | "fish"
  | "eggs"
  | "honey"
  | "grains"
  | "other"
