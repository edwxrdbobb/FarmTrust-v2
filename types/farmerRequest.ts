export type FarmerRequestStatus = "pending" | "approved" | "rejected" | "more-info-needed"

export interface FarmerRequest {
  id: string
  userId: string
  farmName: string
  description: string
  location: string
  farmerType: "organic" | "waste-to-resource" | "fish" | "cattle"
  documents: string[]
  status: FarmerRequestStatus
  adminNotes?: string
  createdAt: string
  updatedAt: string
  reviewedAt?: string
  reviewedBy?: string
}
