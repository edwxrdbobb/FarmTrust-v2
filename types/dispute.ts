export type DisputeStatus = "open" | "under-review" | "resolved-buyer" | "resolved-vendor" | "closed"

export type DisputeReason = "quality-issues" | "wrong-item" | "missing-item" | "damaged" | "late-delivery" | "other"

export interface Dispute {
  id: string
  orderId: string
  buyerId: string
  vendorId: string
  reason: DisputeReason
  description: string
  evidence: string[]
  status: DisputeStatus
  adminNotes?: string
  resolution?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}
