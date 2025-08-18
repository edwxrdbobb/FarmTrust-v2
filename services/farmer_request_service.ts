import * as farmerRequestRepo from "@/repositories/farmer_request_repo";
import * as userRepo from "@/repositories/user_repo";
import * as vendorRepo from "@/repositories/vendor_repo";
import * as notificationService from "./notification_service";
import { connectDB } from "@/lib/db";
import { startTransaction, commitTransaction, abortTransaction } from "@/lib/db_transaction";
import { Types } from "mongoose";

// Simplified interface for our registration form
export interface SimpleFarmerRequestData {
  farmName: string;
  description: string;
  location: string;
  farmerType: string;
  documents: string[];
  contactPhone: string;
  yearsOfExperience?: number;
  farmSize?: {
    value: number;
    unit: string;
  };
}

export interface CreateFarmerRequestData {
  farmName: string;
  farmLocation: string;
  farmSize: number;
  farmType: string;
  cropTypes: string[];
  farmingExperience: number;
  certifications?: string[];
  businessRegistration?: string;
  taxId?: string;
  bankAccountDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingNumber?: string;
  };
  documents: {
    farmLicense?: string;
    identityDocument: string;
    farmPhotos: string[];
    certificationDocuments?: string[];
  };
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  description?: string;
}

export interface UpdateFarmerRequestData {
  status?: FarmerRequestStatus;
  adminNotes?: string;
  rejectionReason?: string;
  verificationNotes?: string;
  approvedBy?: string;
  rejectedBy?: string;
}

export enum FarmerRequestStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUIRES_DOCUMENTS = 'requires_documents',
  VERIFICATION_PENDING = 'verification_pending'
}

export enum FarmType {
  ORGANIC = 'organic',
  CONVENTIONAL = 'conventional',
  HYDROPONIC = 'hydroponic',
  GREENHOUSE = 'greenhouse',
  LIVESTOCK = 'livestock',
  MIXED = 'mixed',
  AQUACULTURE = 'aquaculture'
}

export enum RequestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Simplified create function for our registration form
export async function createSimpleFarmerRequest(userId: string, requestData: SimpleFarmerRequestData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Validate user exists
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Check if user already has a pending or approved farmer request
    const existingRequest = await farmerRequestRepo.getFarmerRequestByUserId(userId);
    if (existingRequest && (existingRequest.status === 'pending' || 
                           existingRequest.status === 'under_review' ||
                           existingRequest.status === 'approved')) {
      return { success: false, error: "You already have an active farmer request" };
    }

    // Check if user is already a vendor
    const existingVendor = await vendorRepo.getVendorByUserId(userId);
    if (existingVendor) {
      return { success: false, error: "User is already registered as a vendor" };
    }

    // Create farmer request data
    const farmerRequestData = {
      userId: new Types.ObjectId(userId),
      farmName: requestData.farmName,
      description: requestData.description,
      location: requestData.location,
      farmerType: requestData.farmerType,
      documents: requestData.documents,
      contactPhone: requestData.contactPhone,
      yearsOfExperience: requestData.yearsOfExperience || 0,
      farmSize: requestData.farmSize || { value: 0, unit: "acres" },
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const farmerRequest = await farmerRequestRepo.createFarmerRequest(farmerRequestData, session);

    await commitTransaction(session);
    return { success: true, data: farmerRequest };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error creating simple farmer request:", error);
    return { success: false, error: "Failed to create farmer request" };
  }
}

// Alias for backward compatibility
export async function createFarmerRequest(userId: string, requestData: CreateFarmerRequestData) {
  return createSimpleFarmerRequest(userId, requestData as any);
}

export async function getFarmerRequestById(requestId: string, userId?: string) {
  try {
    await connectDB();
    const request = await farmerRequestRepo.getFarmerRequestById(requestId);
    
    if (!request) {
      return { success: false, error: "Farmer request not found" };
    }

    // Check access permissions
    if (userId) {
      const user = await userRepo.getUserById(userId);
      const hasAccess = user?.role === 'admin' || request.user.toString() === userId;
      
      if (!hasAccess) {
        return { success: false, error: "Unauthorized to view this request" };
      }
    }

    return { success: true, data: request };
  } catch (error) {
    console.error("Error fetching farmer request:", error);
    return { success: false, error: "Failed to fetch farmer request" };
  }
}

export async function getUserFarmerRequest(userId: string) {
  try {
    await connectDB();
    
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const request = await farmerRequestRepo.getFarmerRequestByUserId(userId);
    
    if (!request) {
      return { success: false, error: "No farmer request found for this user" };
    }

    return { success: true, data: request };
  } catch (error) {
    console.error("Error fetching user farmer request:", error);
    return { success: false, error: "Failed to fetch farmer request" };
  }
}

export async function getAllFarmerRequests(adminId: string, filters?: any, page: number = 1, limit: number = 10) {
  try {
    await connectDB();
    
    // Validate admin
    const admin = await userRepo.getUserById(adminId);
    if (!admin || admin.role !== 'admin') {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    const requests = await farmerRequestRepo.getFarmerRequests(filters, page, limit);
    return { success: true, data: requests };
  } catch (error) {
    console.error("Error fetching farmer requests:", error);
    return { success: false, error: "Failed to fetch farmer requests" };
  }
}

export async function updateFarmerRequestStatus(requestId: string, adminId: string, updateData: UpdateFarmerRequestData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const request = await farmerRequestRepo.getFarmerRequestById(requestId);
    if (!request) {
      return { success: false, error: "Farmer request not found" };
    }

    // Validate admin
    const admin = await userRepo.getUserById(adminId);
    if (!admin || admin.role !== 'admin') {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    // Handle status-specific logic
    if (updateData.status === FarmerRequestStatus.APPROVED) {
      const vendorResult = await approveFarmerRequest(request, adminId, session);
      if (!vendorResult.success) {
        return vendorResult;
      }
      updateData.approvedBy = adminId;
    } else if (updateData.status === FarmerRequestStatus.REJECTED) {
      updateData.rejectedBy = adminId;
    }

    // Update farmer request
    const updatedRequest = await farmerRequestRepo.updateFarmerRequestById(requestId, {
      ...updateData,
      reviewedAt: new Date(),
      updatedAt: new Date()
    }, { session, new: true });

    // Send notification to user
    await notificationService.createFarmerRequestStatusNotification(
      request.user.toString(),
      requestId,
      getStatusNotificationMessage(updateData.status!, updateData.rejectionReason)
    );

    await commitTransaction(session);
    return { success: true, data: updatedRequest };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error updating farmer request status:", error);
    return { success: false, error: "Failed to update farmer request status" };
  }
}

export async function requestAdditionalDocuments(requestId: string, adminId: string, requiredDocuments: string[], notes: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const request = await farmerRequestRepo.getFarmerRequestById(requestId);
    if (!request) {
      return { success: false, error: "Farmer request not found" };
    }

    // Validate admin
    const admin = await userRepo.getUserById(adminId);
    if (!admin || admin.role !== 'admin') {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    // Update request
    const updatedRequest = await farmerRequestRepo.updateFarmerRequestById(requestId, {
      status: FarmerRequestStatus.REQUIRES_DOCUMENTS,
      requiredDocuments,
      adminNotes: notes,
      updatedAt: new Date()
    }, { session, new: true });

    // Send notification to user
    await notificationService.createFarmerRequestStatusNotification(
      request.user.toString(),
      requestId,
      `Additional documents required: ${requiredDocuments.join(', ')}. ${notes}`
    );

    await commitTransaction(session);
    return { success: true, data: updatedRequest };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error requesting additional documents:", error);
    return { success: false, error: "Failed to request additional documents" };
  }
}

export async function submitAdditionalDocuments(requestId: string, userId: string, documents: Record<string, string>) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const request = await farmerRequestRepo.getFarmerRequestById(requestId);
    if (!request) {
      return { success: false, error: "Farmer request not found" };
    }

    if (request.user.toString() !== userId) {
      return { success: false, error: "Unauthorized to update this request" };
    }

    if (request.status !== FarmerRequestStatus.REQUIRES_DOCUMENTS) {
      return { success: false, error: "Request is not in a state that accepts additional documents" };
    }

    // Update documents
    const updatedDocuments = { ...request.documents, ...documents };

    const updatedRequest = await farmerRequestRepo.updateFarmerRequestById(requestId, {
      documents: updatedDocuments,
      status: FarmerRequestStatus.VERIFICATION_PENDING,
      documentsSubmittedAt: new Date(),
      updatedAt: new Date()
    }, { session, new: true });

    // Send notification to admins
    const admins = await userRepo.getUsersByRole('admin');
    for (const admin of admins) {
      await notificationService.createNotification({
        user: admin._id.toString(),
        title: 'Additional Documents Submitted',
        message: `Additional documents submitted for farmer request #${requestId}`,
        type: 'farmer_request',
        relatedId: requestId,
        relatedModel: 'FarmerRequest'
      });
    }

    await commitTransaction(session);
    return { success: true, data: updatedRequest };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error submitting additional documents:", error);
    return { success: false, error: "Failed to submit additional documents" };
  }
}

export async function getFarmerRequestStats(adminId?: string) {
  try {
    await connectDB();
    
    // Validate admin access
    if (adminId) {
      const admin = await userRepo.getUserById(adminId);
      if (!admin || admin.role !== 'admin') {
        return { success: false, error: "Unauthorized - Admin access required" };
      }
    }

    const stats = await farmerRequestRepo.getFarmerRequestStatistics();
    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching farmer request stats:", error);
    return { success: false, error: "Failed to fetch farmer request statistics" };
  }
}

export async function deleteFarmerRequest(requestId: string, userId: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const request = await farmerRequestRepo.getFarmerRequestById(requestId);
    if (!request) {
      return { success: false, error: "Farmer request not found" };
    }

    // Check permissions
    const user = await userRepo.getUserById(userId);
    const canDelete = user?.role === 'admin' || request.user.toString() === userId;
    
    if (!canDelete) {
      return { success: false, error: "Unauthorized to delete this request" };
    }

    // Can only delete pending or rejected requests
    if (request.status === FarmerRequestStatus.APPROVED) {
      return { success: false, error: "Cannot delete approved farmer requests" };
    }

    await farmerRequestRepo.deleteFarmerRequestById(requestId, { session });

    await commitTransaction(session);
    return { success: true, message: "Farmer request deleted successfully" };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error deleting farmer request:", error);
    return { success: false, error: "Failed to delete farmer request" };
  }
}

// Helper functions
async function approveFarmerRequest(request: any, adminId: string, session: any) {
  try {
    // Create vendor profile
    const vendorData = {
      user: request.user,
      businessName: request.farmName,
      businessType: 'farm',
      description: request.description || `${request.farmType} farm specializing in ${request.cropTypes.join(', ')}`,
      address: {
        street: request.contactInfo.address,
        city: request.farmLocation,
        state: '',
        zipCode: '',
        country: ''
      },
      phone: request.contactInfo.phone,
      email: request.contactInfo.email,
      bankDetails: request.bankAccountDetails,
      documents: {
        businessLicense: request.documents.farmLicense,
        taxCertificate: request.businessRegistration,
        identityDocument: request.documents.identityDocument
      },
      farmDetails: {
        farmSize: request.farmSize,
        farmType: request.farmType,
        cropTypes: request.cropTypes,
        farmingExperience: request.farmingExperience,
        certifications: request.certifications,
        farmPhotos: request.documents.farmPhotos
      },
      isVerified: true,
      verifiedBy: adminId,
      verifiedAt: new Date(),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const vendor = await vendorRepo.createVendor(vendorData, session);

    // Update user role to vendor
    await userRepo.updateUser(request.user.toString(), {
      role: 'vendor',
      vendorProfile: vendor._id,
      updatedAt: new Date()
    }, session);

    return { success: true, data: vendor };
  } catch (error) {
    console.error("Error approving farmer request:", error);
    return { success: false, error: "Failed to create vendor profile" };
  }
}

function determinePriority(farmSize: number, farmType: string): RequestPriority {
  // Large farms get higher priority
  if (farmSize > 100) {
    return RequestPriority.HIGH;
  }
  
  // Organic farms get medium priority
  if (farmType === FarmType.ORGANIC) {
    return RequestPriority.MEDIUM;
  }
  
  // Default to low priority
  return RequestPriority.LOW;
}

function getStatusNotificationMessage(status: FarmerRequestStatus, rejectionReason?: string): string {
  switch (status) {
    case FarmerRequestStatus.APPROVED:
      return 'Congratulations! Your farmer registration has been approved. You can now start selling on FarmTrust.';
    case FarmerRequestStatus.REJECTED:
      return `Your farmer registration has been rejected. Reason: ${rejectionReason || 'Please contact support for more information.'}`;
    case FarmerRequestStatus.UNDER_REVIEW:
      return 'Your farmer registration is now under review. We will notify you once the review is complete.';
    case FarmerRequestStatus.VERIFICATION_PENDING:
      return 'Your additional documents have been received and are pending verification.';
    default:
      return 'Your farmer registration status has been updated.';
  }
}

export async function getFarmerRequestByUserId(userId: string) {
  try {
    await connectDB();
    const request = await farmerRequestRepo.getFarmerRequestByUserId(userId);
    return { success: true, data: request };
  } catch (error) {
    console.error("Error getting farmer request by user ID:", error);
    return { success: false, error: "Failed to get farmer request" };
  }
}

export async function getFarmerRequests(filters: any = {}, page: number = 1, limit: number = 10) {
  try {
    await connectDB();
    const skip = (page - 1) * limit;
    const requests = await farmerRequestRepo.getFarmerRequests(filters, { skip, limit });
    const total = await farmerRequestRepo.countFarmerRequests(filters);
    
    return {
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error("Error getting farmer requests:", error);
    return { success: false, error: "Failed to get farmer requests" };
  }
}