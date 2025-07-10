import { ObjectId } from 'mongodb';

export interface PickupRequest {
  _id?: ObjectId;
  requesterId: ObjectId; // User who requested pickup
  assignedDriverId?: ObjectId;
  ngoId?: ObjectId; // If assigned to NGO
  
  // Items to be picked up
  itemIds: ObjectId[];
  totalItems: number;
  estimatedWeight?: number; // in kg
  
  // Pickup Details
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  
  // Scheduling
  requestedDate: Date;
  requestedTimeSlot: string;
  scheduledDate?: Date;
  actualPickupDate?: Date;
  
  // Status and Tracking
  status: 'requested' | 'scheduled' | 'en-route' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Contact Information
  contactPerson: {
    name: string;
    phone: string;
    email?: string;
  };
  
  // Special Instructions
  specialInstructions?: string;
  accessInstructions?: string;
  
  // Completion Details
  completionNotes?: string;
  completionPhotos?: string[];
  signature?: string; // base64 encoded signature
  
  // Route Optimization
  routeId?: ObjectId;
  routeOrder?: number;
  estimatedDuration?: number; // in minutes
  
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryRoute {
  _id?: ObjectId;
  driverId: ObjectId;
  vehicleId?: ObjectId;
  
  // Route Details
  routeName: string;
  plannedDate: Date;
  startTime?: Date;
  endTime?: Date;
  
  // Stops
  pickupRequests: ObjectId[];
  optimizedOrder: number[];
  
  // Route Metrics
  totalDistance?: number; // in km
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  fuelCost?: number; // in cents
  
  // Status
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  
  // Tracking
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Driver {
  _id?: ObjectId;
  userId: ObjectId;
  
  // Driver Information
  licenseNumber: string;
  licenseExpiry: Date;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    capacity: number; // in kg
    type: 'car' | 'van' | 'truck';
  };
  
  // Service Areas
  serviceAreas: string[]; // zip codes
  maxRadius: number; // in km
  
  // Availability
  availability: {
    [key: string]: {
      isAvailable: boolean;
      startTime?: string;
      endTime?: string;
    };
  };
  
  // Performance Metrics
  stats: {
    totalPickups: number;
    successRate: number;
    averageRating: number;
    totalDistance: number; // in km
  };
  
  // Verification
  isVerified: boolean;
  backgroundCheckDate?: Date;
  insuranceExpiry?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}