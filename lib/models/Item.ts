import { UploadedFile } from '@/components/ui/file-upload';
import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
  submitterId: mongoose.Types.ObjectId;
  retailerId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  brand?: string;
  category: string;
  subcategory?: string;
  condition: 'like-new' | 'very-good' | 'good' | 'fair' | 'poor';
  size?: string;
  color?: string;
  material?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  images: UploadedFile[];
  imagePublicIds?: string[];
  receiptImage?: string;
  receiptPublicId?: string;
  originalPrice?: number;
  estimatedValue?: number;
  resalePrice?: number;
  status: 'submitted' | 'reviewed' | 'approved' | 'collected' | 'processing' | 'completed' | 'rejected';
  destination: 'donate' | 'resale' | 'recycle' | 'return-to-retailer' | 'pending';
  destinationId?: mongoose.Types.ObjectId;
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
  trackingNumber?: string;
  pickupDate?: Date;
  deliveryDate?: Date;
  impactMetrics: {
    co2Saved: number;
    wasteAverted: number;
    waterSaved?: number;
  };
  marketplaceData?: {
    isListed: boolean;
    listingDate?: Date;
    views: number;
    favorites: number;
    soldDate?: Date;
    buyerId?: mongoose.Types.ObjectId;
    shippingMethod?: string;
    shippingCost?: number;
  };
  tags?: string[];
  notes?: string;
  internalNotes?: string;
}

const ItemSchema = new Schema<IItem>({
  submitterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  retailerId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [100, 'Brand cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['clothing', 'electronics', 'shoes', 'accessories', 'home', 'books', 'sports', 'toys', 'beauty', 'other']
  },
  subcategory: String,
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['like-new', 'very-good', 'good', 'fair', 'poor']
  },
  size: String,
  color: String,
  material: String,
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'in'],
      default: 'cm'
    }
  },
  images: {
    type: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        format: String,
        width: Number,
        height: Number,
        name: String,
        size: Number,
      }
    ],
    required: [true, 'At least one image is required'],
    validate: {
      validator: function (v: any[]) {
        return v && v.length > 0 && v.length <= 10;
      },
      message: 'Must have between 1 and 10 images',
    },
  },
  imagePublicIds: [String],
  receiptImage: String,
  receiptPublicId: String,
  originalPrice: {
    type: Number,
    min: [0, 'Price cannot be negative']
  },
  estimatedValue: {
    type: Number,
    min: [0, 'Value cannot be negative']
  },
  resalePrice: {
    type: Number,
    min: [0, 'Price cannot be negative']
  },
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'approved', 'collected', 'processing', 'completed', 'rejected'],
    default: 'submitted'
  },
  destination: {
    type: String,
    enum: ['donate', 'resale', 'recycle', 'return-to-retailer', 'pending'],
    required: [true, 'Destination is required']
  },
  destinationId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  pickupAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'US' },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  pickupPreferences: {
    preferredDate: Date,
    preferredTimeSlot: String,
    specialInstructions: String,
    contactPhone: String
  },
  trackingNumber: String,
  pickupDate: Date,
  deliveryDate: Date,
  impactMetrics: {
    co2Saved: { type: Number, required: true, default: 0 },
    wasteAverted: { type: Number, required: true, default: 0 },
    waterSaved: Number
  },
  marketplaceData: {
    isListed: { type: Boolean, default: false },
    listingDate: Date,
    views: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    soldDate: Date,
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    shippingMethod: String,
    shippingCost: Number
  },
  tags: [String],
  notes: String,
  internalNotes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
ItemSchema.index({ submitterId: 1 });
ItemSchema.index({ category: 1 });
ItemSchema.index({ status: 1 });
ItemSchema.index({ destination: 1 });
ItemSchema.index({ 'marketplaceData.isListed': 1 });
ItemSchema.index({ 'pickupAddress.zipCode': 1 });
ItemSchema.index({ createdAt: -1 });

// Compound indexes
ItemSchema.index({ category: 1, status: 1 });
ItemSchema.index({ destination: 1, status: 1 });

export default mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema);