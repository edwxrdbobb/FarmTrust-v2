export type UserRole = "admin" | "vendor" | "buyer"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface Buyer extends User {
  role: "buyer"
  address?: string
  phone?: string
  profileImage?: string
}

export interface Vendor extends User {
  role: "vendor"
  farmName: string
  description: string
  location: string
  phone: string
  profileImage?: string
  coverImage?: string
  verified: boolean
  rating: number
  farmerType: "organic" | "waste-to-resource" | "fish" | "cattle"
}

export interface Admin extends User {
  role: "admin"
  permissions: string[]
}
