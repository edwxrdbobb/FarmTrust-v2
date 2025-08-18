import * as addressRepo from "@/repositories/address_repo";
import * as userRepo from "@/repositories/user_repo";
import * as notificationService from "./notification_service";
import { connectDB } from "@/lib/db";
import { startTransaction, commitTransaction, abortTransaction } from "@/lib/db_transaction";
import { Types } from "mongoose";

export interface CreateAddressData {
  type: AddressType;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  isDefault?: boolean;
  deliveryInstructions?: string;
}

export interface UpdateAddressData {
  firstName?: string;
  lastName?: string;
  company?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  isDefault?: boolean;
  deliveryInstructions?: string;
  isActive?: boolean;
}

export interface ValidateAddressData {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export enum AddressType {
  SHIPPING = 'shipping',
  BILLING = 'billing',
  BOTH = 'both'
}

export async function createAddress(userId: string, addressData: CreateAddressData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Validate user
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Validate address data
    const validationResult = validateAddressData(addressData);
    if (!validationResult.isValid) {
      return { success: false, error: validationResult.error };
    }

    // Check if this is the first address (make it default)
    const existingAddresses = await addressRepo.getAddressesByUser(userId);
    const isFirstAddress = existingAddresses.length === 0;

    // If setting as default, unset other default addresses of the same type
    if (addressData.isDefault || isFirstAddress) {
      await addressRepo.unsetDefaultAddresses(userId, addressData.type, session);
    }

    // Validate address with external service (optional)
    const addressValidation = await validateAddressWithService({
      addressLine1: addressData.addressLine1,
      addressLine2: addressData.addressLine2,
      city: addressData.city,
      state: addressData.state,
      postalCode: addressData.postalCode,
      country: addressData.country
    });

    // Create address
    const address = await addressRepo.createAddress({
      user: userId,
      type: addressData.type,
      firstName: addressData.firstName,
      lastName: addressData.lastName,
      company: addressData.company,
      addressLine1: addressData.addressLine1,
      addressLine2: addressData.addressLine2,
      city: addressData.city,
      state: addressData.state,
      postalCode: addressData.postalCode,
      country: addressData.country,
      phoneNumber: addressData.phoneNumber,
      deliveryInstructions: addressData.deliveryInstructions,
      isDefault: addressData.isDefault || isFirstAddress,
      isActive: true,
      isVerified: addressValidation.isValid,
      validationData: addressValidation.data,
      createdAt: new Date(),
      updatedAt: new Date()
    }, session);

    // Send notification
    await notificationService.createNotification({
      user: userId,
      title: 'Address Added',
      message: `Your ${addressData.type} address has been added successfully`,
      type: 'account',
      relatedId: address._id.toString(),
      relatedModel: 'Address'
    });

    await commitTransaction(session);
    return { success: true, data: address };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error creating address:", error);
    return { success: false, error: "Failed to create address" };
  }
}

export async function getAddressById(addressId: string, userId: string) {
  try {
    await connectDB();
    
    const address = await addressRepo.getAddressById(addressId);
    if (!address) {
      return { success: false, error: "Address not found" };
    }

    // Check ownership
    if (address.user.toString() !== userId) {
      return { success: false, error: "Unauthorized to access this address" };
    }

    return { success: true, data: address };
  } catch (error) {
    console.error("Error fetching address:", error);
    return { success: false, error: "Failed to fetch address" };
  }
}

export async function getUserAddresses(userId: string, type?: AddressType, includeInactive: boolean = false) {
  try {
    await connectDB();
    
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const addresses = await addressRepo.getAddressesByUser(userId, type, includeInactive);
    return { success: true, data: addresses };
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    return { success: false, error: "Failed to fetch addresses" };
  }
}

export async function getDefaultAddress(userId: string, type: AddressType) {
  try {
    await connectDB();
    
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const address = await addressRepo.getDefaultAddress(userId, type);
    if (!address) {
      return { success: false, error: "No default address found" };
    }

    return { success: true, data: address };
  } catch (error) {
    console.error("Error fetching default address:", error);
    return { success: false, error: "Failed to fetch default address" };
  }
}

export async function updateAddress(addressId: string, userId: string, updateData: UpdateAddressData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const address = await addressRepo.getAddressById(addressId);
    if (!address) {
      return { success: false, error: "Address not found" };
    }

    // Check ownership
    if (address.user.toString() !== userId) {
      return { success: false, error: "Unauthorized to update this address" };
    }

    // If setting as default, unset other default addresses of the same type
    if (updateData.isDefault) {
      await addressRepo.unsetDefaultAddresses(userId, address.type, session);
    }

    // Validate updated address if location fields are changed
    let addressValidation = { isValid: address.isVerified, data: address.validationData };
    if (updateData.addressLine1 || updateData.city || updateData.state || 
        updateData.postalCode || updateData.country) {
      const addressToValidate = {
        addressLine1: updateData.addressLine1 || address.addressLine1,
        addressLine2: updateData.addressLine2 || address.addressLine2,
        city: updateData.city || address.city,
        state: updateData.state || address.state,
        postalCode: updateData.postalCode || address.postalCode,
        country: updateData.country || address.country
      };
      addressValidation = await validateAddressWithService(addressToValidate);
    }

    // Update address
    const updatedAddress = await addressRepo.updateAddress(addressId, {
      ...updateData,
      isVerified: addressValidation.isValid,
      validationData: addressValidation.data,
      updatedAt: new Date()
    }, session);

    await commitTransaction(session);
    return { success: true, data: updatedAddress };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error updating address:", error);
    return { success: false, error: "Failed to update address" };
  }
}

export async function deleteAddress(addressId: string, userId: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const address = await addressRepo.getAddressById(addressId);
    if (!address) {
      return { success: false, error: "Address not found" };
    }

    // Check ownership
    if (address.user.toString() !== userId) {
      return { success: false, error: "Unauthorized to delete this address" };
    }

    // Check if it's the default address
    if (address.isDefault) {
      const otherAddresses = await addressRepo.getAddressesByUser(userId, address.type);
      const activeAddresses = otherAddresses.filter(a => 
        a._id.toString() !== addressId && a.isActive
      );
      
      if (activeAddresses.length > 0) {
        // Set another address as default
        await addressRepo.updateAddress(activeAddresses[0]._id.toString(), {
          isDefault: true,
          updatedAt: new Date()
        }, session);
      }
    }

    // Soft delete the address
    await addressRepo.updateAddress(addressId, {
      isActive: false,
      isDefault: false,
      deletedAt: new Date(),
      updatedAt: new Date()
    }, session);

    await commitTransaction(session);
    return { success: true, message: "Address deleted successfully" };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error deleting address:", error);
    return { success: false, error: "Failed to delete address" };
  }
}

export async function setDefaultAddress(addressId: string, userId: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const address = await addressRepo.getAddressById(addressId);
    if (!address) {
      return { success: false, error: "Address not found" };
    }

    // Check ownership
    if (address.user.toString() !== userId) {
      return { success: false, error: "Unauthorized to modify this address" };
    }

    // Check if address is active
    if (!address.isActive) {
      return { success: false, error: "Cannot set inactive address as default" };
    }

    // Unset other default addresses of the same type
    await addressRepo.unsetDefaultAddresses(userId, address.type, session);

    // Set this address as default
    const updatedAddress = await addressRepo.updateAddress(addressId, {
      isDefault: true,
      updatedAt: new Date()
    }, session);

    await commitTransaction(session);
    return { success: true, data: updatedAddress };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error setting default address:", error);
    return { success: false, error: "Failed to set default address" };
  }
}

export async function validateAddress(addressData: ValidateAddressData) {
  try {
    await connectDB();
    
    const validation = await validateAddressWithService(addressData);
    return { success: true, data: validation };
  } catch (error) {
    console.error("Error validating address:", error);
    return { success: false, error: "Failed to validate address" };
  }
}

export async function searchAddresses(userId: string, query: string, type?: AddressType) {
  try {
    await connectDB();
    
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const addresses = await addressRepo.searchAddresses(userId, query, type);
    return { success: true, data: addresses };
  } catch (error) {
    console.error("Error searching addresses:", error);
    return { success: false, error: "Failed to search addresses" };
  }
}

export async function getAddressStats(userId: string) {
  try {
    await connectDB();
    
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const stats = await addressRepo.getAddressStatsByUser(userId);
    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching address stats:", error);
    return { success: false, error: "Failed to fetch address statistics" };
  }
}

export async function calculateShippingCost(addressId: string, items: any[], shippingMethod?: string) {
  try {
    await connectDB();
    
    const address = await addressRepo.getAddressById(addressId);
    if (!address) {
      return { success: false, error: "Address not found" };
    }

    // Calculate shipping cost based on address and items
    const shippingCost = await calculateShippingCostForAddress(address, items, shippingMethod);
    
    return { success: true, data: shippingCost };
  } catch (error) {
    console.error("Error calculating shipping cost:", error);
    return { success: false, error: "Failed to calculate shipping cost" };
  }
}

export async function getDeliveryEstimate(addressId: string, items: any[], shippingMethod?: string) {
  try {
    await connectDB();
    
    const address = await addressRepo.getAddressById(addressId);
    if (!address) {
      return { success: false, error: "Address not found" };
    }

    // Calculate delivery estimate based on address and items
    const deliveryEstimate = await calculateDeliveryEstimate(address, items, shippingMethod);
    
    return { success: true, data: deliveryEstimate };
  } catch (error) {
    console.error("Error calculating delivery estimate:", error);
    return { success: false, error: "Failed to calculate delivery estimate" };
  }
}

// Helper functions
function validateAddressData(data: CreateAddressData): { isValid: boolean; error?: string } {
  if (!data.firstName || data.firstName.trim().length === 0) {
    return { isValid: false, error: "First name is required" };
  }
  
  if (!data.lastName || data.lastName.trim().length === 0) {
    return { isValid: false, error: "Last name is required" };
  }
  
  if (!data.addressLine1 || data.addressLine1.trim().length === 0) {
    return { isValid: false, error: "Address line 1 is required" };
  }
  
  if (!data.city || data.city.trim().length === 0) {
    return { isValid: false, error: "City is required" };
  }
  
  if (!data.state || data.state.trim().length === 0) {
    return { isValid: false, error: "State is required" };
  }
  
  if (!data.postalCode || data.postalCode.trim().length === 0) {
    return { isValid: false, error: "Postal code is required" };
  }
  
  if (!data.country || data.country.trim().length === 0) {
    return { isValid: false, error: "Country is required" };
  }
  
  // Validate phone number format if provided
  if (data.phoneNumber && !isValidPhoneNumber(data.phoneNumber)) {
    return { isValid: false, error: "Invalid phone number format" };
  }
  
  return { isValid: true };
}

function isValidPhoneNumber(phoneNumber: string): boolean {
  // Basic phone number validation - can be enhanced
  const phoneRegex = /^[+]?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''));
}

async function validateAddressWithService(addressData: ValidateAddressData): Promise<{ isValid: boolean; data?: any; suggestions?: any[] }> {
  try {
    // Mock address validation - implement actual address validation service
    // This could integrate with services like Google Maps API, USPS, etc.
    
    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock validation logic
    const isValid = addressData.postalCode.length >= 5 && 
                   addressData.city.length > 0 && 
                   addressData.state.length > 0;
    
    if (isValid) {
      return {
        isValid: true,
        data: {
          standardizedAddress: {
            addressLine1: addressData.addressLine1.toUpperCase(),
            city: addressData.city.toUpperCase(),
            state: addressData.state.toUpperCase(),
            postalCode: addressData.postalCode,
            country: addressData.country.toUpperCase()
          },
          coordinates: {
            latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
            longitude: -74.0060 + (Math.random() - 0.5) * 0.1
          },
          deliveryPoint: true,
          residential: true
        }
      };
    } else {
      return {
        isValid: false,
        suggestions: [
          {
            addressLine1: addressData.addressLine1,
            city: 'Suggested City',
            state: addressData.state,
            postalCode: '12345',
            country: addressData.country
          }
        ]
      };
    }
  } catch (error) {
    console.error("Address validation service error:", error);
    return { isValid: false };
  }
}

async function calculateShippingCostForAddress(address: any, items: any[], shippingMethod?: string): Promise<any> {
  // Mock shipping cost calculation - implement actual shipping cost calculation
  const baseRate = 5.99;
  const weightRate = 0.50; // per pound
  const distanceRate = 0.10; // per mile (mock)
  
  // Calculate total weight
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1) * item.quantity, 0);
  
  // Mock distance calculation
  const distance = Math.random() * 1000; // Mock distance in miles
  
  // Calculate shipping cost
  let shippingCost = baseRate + (totalWeight * weightRate) + (distance * distanceRate);
  
  // Apply shipping method multiplier
  const methodMultipliers = {
    'standard': 1.0,
    'expedited': 1.5,
    'overnight': 2.5,
    'same_day': 4.0
  };
  
  const multiplier = methodMultipliers[shippingMethod as keyof typeof methodMultipliers] || 1.0;
  shippingCost *= multiplier;
  
  return {
    cost: Math.round(shippingCost * 100) / 100,
    currency: 'USD',
    method: shippingMethod || 'standard',
    breakdown: {
      baseRate,
      weightCost: totalWeight * weightRate,
      distanceCost: distance * distanceRate,
      methodMultiplier: multiplier
    }
  };
}

async function calculateDeliveryEstimate(address: any, items: any[], shippingMethod?: string): Promise<any> {
  // Mock delivery estimate calculation
  const now = new Date();
  
  // Base delivery times in days
  const deliveryTimes = {
    'standard': 5,
    'expedited': 3,
    'overnight': 1,
    'same_day': 0
  };
  
  const baseDays = deliveryTimes[shippingMethod as keyof typeof deliveryTimes] || 5;
  
  // Add processing time
  const processingDays = 1;
  
  // Calculate delivery date
  const deliveryDate = new Date(now);
  deliveryDate.setDate(deliveryDate.getDate() + baseDays + processingDays);
  
  // Skip weekends for standard shipping
  if (shippingMethod === 'standard' && deliveryDate.getDay() === 0) {
    deliveryDate.setDate(deliveryDate.getDate() + 1); // Skip Sunday
  }
  if (shippingMethod === 'standard' && deliveryDate.getDay() === 6) {
    deliveryDate.setDate(deliveryDate.getDate() + 2); // Skip Saturday
  }
  
  return {
    estimatedDeliveryDate: deliveryDate,
    businessDays: baseDays,
    processingDays,
    method: shippingMethod || 'standard',
    deliveryWindow: {
      earliest: new Date(deliveryDate.getTime() - 24 * 60 * 60 * 1000),
      latest: new Date(deliveryDate.getTime() + 24 * 60 * 60 * 1000)
    }
  };
}