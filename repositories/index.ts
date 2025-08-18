//@ts-check

// User Repository
export * from './user_repo';

// Vendor Repository
export * from './vendor_repo';

// Product Repository
export * from './product_repo';

// Category Repository
export * from './category_repo';

// Order Repository
export * from './order_repo';

// Cart Repository
export * from './cart_repo';

// Dispute Repository
export * from './dispute_repo';

// Farmer Request Repository
export * from './farmer_request_repo';

// Review Repository
export * from './review_repo';

// Address Repository
export * from './address_repo';

// Escrow Repository
export * from './escrow_repo';

// Analytics Repository
export * from './analytics_repo';

// Conversation Repository
export * from './conversation_repo';

// Message Repository
export * from './message_repo';

// Notification Repository
export * from './notification_repo';

// Payment Method Repository
export * from './payment_method_repo';

// Export repository modules as named exports for selective importing
export * as UserRepo from './user_repo';
export * as VendorRepo from './vendor_repo';
export * as ProductRepo from './product_repo';
export * as CategoryRepo from './category_repo';
export * as OrderRepo from './order_repo';
export * as CartRepo from './cart_repo';
export * as DisputeRepo from './dispute_repo';
export * as FarmerRequestRepo from './farmer_request_repo';
export * as ReviewRepo from './review_repo';
export * as AddressRepo from './address_repo';
export * as EscrowRepo from './escrow_repo';
export * as AnalyticsRepo from './analytics_repo';
export * as ConversationRepo from './conversation_repo';
export * as MessageRepo from './message_repo';
export * as NotificationRepo from './notification_repo';
export * as PaymentMethodRepo from './payment_method_repo';

/**
 * Repository collection for easy access to all repositories
 * Usage: import { Repositories } from '@/repositories';
 * Then: Repositories.User.createUser(data)
 */
export const Repositories = {
  User: require('./user_repo'),
  Vendor: require('./vendor_repo'),
  Product: require('./product_repo'),
  Category: require('./category_repo'),
  Order: require('./order_repo'),
  Cart: require('./cart_repo'),
  Dispute: require('./dispute_repo'),
  FarmerRequest: require('./farmer_request_repo'),
  Review: require('./review_repo'),
  Address: require('./address_repo'),
  Escrow: require('./escrow_repo'),
  Analytics: require('./analytics_repo'),
  Conversation: require('./conversation_repo'),
  Message: require('./message_repo'),
  Notification: require('./notification_repo'),
  PaymentMethod: require('./payment_method_repo')
};

/**
 * Type definitions for repository functions
 * These can be used for type checking in TypeScript
 */
export type RepositoryFunction = (...args: any[]) => Promise<any>;

export interface IRepository {
  [key: string]: RepositoryFunction;
}

/**
 * Repository names for dynamic access
 */
export const REPOSITORY_NAMES = [
  'User',
  'Vendor', 
  'Product',
  'Category',
  'Order',
  'Cart',
  'Dispute',
  'FarmerRequest',
  'Review',
  'Address',
  'Escrow',
  'Analytics',
  'Conversation',
  'Message',
  'Notification',
  'PaymentMethod'
] as const;

export type RepositoryName = typeof REPOSITORY_NAMES[number];

/**
 * Helper function to get repository by name
 * @param {RepositoryName} name - The repository name
 * @returns {IRepository} The repository module
 */
export function getRepository(name: RepositoryName): IRepository {
  return Repositories[name];
}

/**
 * Helper function to check if repository exists
 * @param {string} name - The repository name
 * @returns {boolean} True if repository exists
 */
export function hasRepository(name: string): name is RepositoryName {
  return REPOSITORY_NAMES.includes(name as RepositoryName);
}