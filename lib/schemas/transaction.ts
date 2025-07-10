import { ObjectId } from 'mongodb';

export interface Transaction {
  _id?: ObjectId;
  type: 'purchase' | 'donation' | 'pickup-fee' | 'commission' | 'refund';
  
  // Parties Involved
  buyerId?: ObjectId;
  sellerId?: ObjectId;
  itemId: ObjectId;
  
  // Financial Details
  amount: number; // in cents
  currency: 'USD';
  fees: {
    platformFee: number; // in cents
    paymentProcessingFee: number; // in cents
    shippingFee?: number; // in cents
  };
  netAmount: number; // amount after fees, in cents
  
  // Payment Information
  paymentMethod: 'stripe' | 'paypal' | 'bank-transfer';
  paymentIntentId?: string; // Stripe payment intent ID
  stripeChargeId?: string;
  
  // Status and Tracking
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed';
  failureReason?: string;
  
  // Shipping (if applicable)
  shippingAddress?: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  shippingCarrier?: string;
  
  // Metadata
  metadata?: Record<string, any>;
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface EcoPoints {
  _id?: ObjectId;
  userId: ObjectId;
  itemId?: ObjectId;
  transactionId?: ObjectId;
  
  points: number;
  type: 'earned' | 'redeemed' | 'bonus' | 'penalty';
  reason: string;
  description?: string;
  
  // Redemption details (if applicable)
  redemptionDetails?: {
    rewardType: string;
    rewardValue: number;
    rewardDescription: string;
  };
  
  expiresAt?: Date;
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}