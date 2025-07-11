import mongoose, { Schema, Document } from 'mongoose';

export interface IPickupRequest extends Document {
  requesterId: mongoose.Types.ObjectId;
  assignedDriverId?: mongoose.Types.ObjectId;
  ngoId?: mongoose.Types.ObjectId;
  itemIds: mongoose.Types.ObjectId[];
  totalItems: number;
  estimatedWeight?: number;
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
  requestedDate: Date;
  requestedTimeSlot: string;
  scheduledDate?: Date;
  actualPickupDate?: Date;
  status: 'requested' | 'scheduled' | 'en-route' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  contactPerson: {
    name: string;
    phone: string;
    email?: string;
  };
  specialInstructions?: string;
  accessInstructions?: string;
  completionNotes?: string;
  completionPhotos?: string[];
  signature?: string;
  routeId?: mongoose.Types.ObjectId;
  routeOrder?: number;
  estimatedDuration?: number;
}

const PickupRequestSchema = new Schema<IPickupRequest>({
  requesterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedDriverId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  ngoId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  itemIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  }],
  totalItems: {
    type: Number,
    required: true,
    min: [1, 'Must have at least 1 item']
  },
  estimatedWeight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  pickupAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'US' },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  requestedDate: {
    type: Date,
    required: true
  },
  requestedTimeSlot: {
    type: String,
    required: true,
    enum: ['morning', 'afternoon', 'evening', 'anytime']
  },
  scheduledDate: Date,
  actualPickupDate: Date,
  status: {
    type: String,
    enum: ['requested', 'scheduled', 'en-route', 'completed', 'failed', 'cancelled'],
    default: 'requested'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  contactPerson: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String
  },
  specialInstructions: String,
  accessInstructions: String,
  completionNotes: String,
  completionPhotos: [String],
  signature: String,
  routeId: {
    type: Schema.Types.ObjectId,
    ref: 'DeliveryRoute'
  },
  routeOrder: Number,
  estimatedDuration: Number
}, {
  timestamps: true
});

// Indexes
PickupRequestSchema.index({ requesterId: 1 });
PickupRequestSchema.index({ status: 1 });
PickupRequestSchema.index({ requestedDate: 1 });
PickupRequestSchema.index({ 'pickupAddress.zipCode': 1 });
PickupRequestSchema.index({ ngoId: 1 });

export default mongoose.models.PickupRequest || mongoose.model<IPickupRequest>('PickupRequest', PickupRequestSchema);