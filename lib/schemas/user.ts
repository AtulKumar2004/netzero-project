import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  password: string; // hashed
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'customer' | 'retailer' | 'ngo' | 'admin';
  address?: {
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
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    sustainability: {
      preferredDestination: 'donate' | 'resale' | 'recycle' | 'any';
      impactGoals: string[];
    };
  };
  stats?: {
    itemsSubmitted: number;
    itemsDonated: number;
    itemsResold: number;
    co2Saved: number; // in kg
    revenueGenerated: number; // in cents
    ecoPoints: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface RetailerProfile {
  _id?: ObjectId;
  userId: ObjectId;
  businessName: string;
  businessType: string;
  taxId?: string;
  website?: string;
  description?: string;
  logo?: string;
  operatingHours?: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  serviceAreas: string[]; // zip codes or city names
  returnPolicies: {
    acceptedCategories: string[];
    conditionRequirements: string[];
    timeLimit: number; // days
  };
  paymentInfo?: {
    stripeAccountId: string;
    bankAccount?: {
      accountNumber: string;
      routingNumber: string;
    };
  };
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NGOProfile {
  _id?: ObjectId;
  userId: ObjectId;
  organizationName: string;
  registrationNumber?: string;
  taxExemptStatus?: string;
  website?: string;
  mission: string;
  description?: string;
  logo?: string;
  serviceAreas: string[];
  acceptedCategories: string[];
  pickupCapacity: {
    maxItemsPerPickup: number;
    vehicleTypes: string[];
    operatingDays: string[];
  };
  certifications?: string[];
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}