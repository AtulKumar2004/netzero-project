import { ObjectId } from 'mongodb';

export interface Item {
  _id?: ObjectId;
  submitterId: ObjectId; // User who submitted the item
  retailerId?: ObjectId; // Original retailer (if applicable)
  
  // Basic Information
  title: string;
  description: string;
  brand?: string;
  category: string;
  subcategory?: string;
  condition: 'like-new' | 'very-good' | 'good' | 'fair' | 'poor';
  
  // Physical Properties
  size?: string;
  color?: string;
  material?: string;
  weight?: number; // in grams
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  
  // Images and Documentation
  images: string[]; // URLs to uploaded images
  imagePublicIds?: string[]; // Cloudinary public IDs for deletion
  receiptImage?: string;
  receiptPublicId?: string;
  
  // Pricing and Value
  originalPrice?: number; // in cents
  estimatedValue?: number; // in cents
  resalePrice?: number; // in cents (if listed for resale)
  
  // Status and Destination
  status: 'submitted' | 'reviewed' | 'approved' | 'collected' | 'processing' | 'completed' | 'rejected';
  destination: 'donate' | 'resale' | 'recycle' | 'return-to-retailer' | 'pending';
  destinationId?: ObjectId; // NGO, Retailer, or Recycler ID
  
  // Logistics
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  pickupPreferences: {
    preferredDate?: Date;
    preferredTimeSlot?: string;
    specialInstructions?: string;
    contactPhone?: string;
  };
  
  // Tracking
  trackingNumber?: string;
  pickupDate?: Date;
  deliveryDate?: Date;
  
  // Impact Metrics
  impactMetrics?: {
    co2Saved: number; // in kg
    wasteAverted: number; // in kg
    waterSaved?: number; // in liters
  };
  
  // Marketplace (if resale)
  marketplaceData?: {
    isListed: boolean;
    listingDate?: Date;
    views: number;
    favorites: number;
    soldDate?: Date;
    buyerId?: ObjectId;
    shippingMethod?: string;
    shippingCost?: number; // in cents
  };
  
  // Metadata
  tags?: string[];
  notes?: string;
  internalNotes?: string; // for admin/retailer use
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemCategory {
  _id?: ObjectId;
  name: string;
  slug: string;
  description?: string;
  parentCategory?: ObjectId;
  subcategories?: string[];
  acceptedConditions: string[];
  averageProcessingTime: number; // in hours
  sustainabilityFactor: number; // multiplier for impact calculations
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}