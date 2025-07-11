import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  type: 'purchase' | 'donation' | 'pickup-fee' | 'commission' | 'refund';
  buyerId?: mongoose.Types.ObjectId;
  sellerId?: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  fees: {
    platformFee: number;
    paymentProcessingFee: number;
    shippingFee?: number;
  };
  netAmount: number;
  paymentMethod: 'stripe' | 'paypal' | 'bank-transfer';
  paymentIntentId?: string;
  stripeChargeId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed';
  failureReason?: string;
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
  metadata?: Record<string, any>;
  notes?: string;
}

const TransactionSchema = new Schema<ITransaction>({
  type: {
    type: String,
    enum: ['purchase', 'donation', 'pickup-fee', 'commission', 'refund'],
    required: true
  },
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  itemId: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP']
  },
  fees: {
    platformFee: { type: Number, required: true, default: 0 },
    paymentProcessingFee: { type: Number, required: true, default: 0 },
    shippingFee: Number
  },
  netAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'bank-transfer'],
    required: true
  },
  paymentIntentId: String,
  stripeChargeId: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'disputed'],
    default: 'pending'
  },
  failureReason: String,
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  trackingNumber: String,
  shippingCarrier: String,
  metadata: Schema.Types.Mixed,
  notes: String
}, {
  timestamps: true
});

// Indexes
TransactionSchema.index({ buyerId: 1 });
TransactionSchema.index({ sellerId: 1 });
TransactionSchema.index({ itemId: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ createdAt: -1 });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);