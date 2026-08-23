import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AbstractDocument } from '@app/database';

export enum BookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  ASSIGNED = 'ASSIGNED', // Assigned to a photographer
  IN_PROGRESS = 'IN_PROGRESS', // Shoot started
  COMPLETED = 'COMPLETED', // Shoot finished, pending editing
  EDITING = 'EDITING',
  DELIVERED = 'DELIVERED', // Media delivered
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum TimeFlexibility {
  STRICT = 'STRICT',
  FLEXIBLE = 'FLEXIBLE',
}

@Schema({ _id: false })
export class LocationDetails {
  @Prop({ required: true })
  address: string;

  @Prop()
  landmark?: string;

  @Prop({ required: true })
  pincode: string;

  @Prop({ required: true })
  city: string;

  @Prop({ type: [Number], index: '2dsphere' }) // [longitude, latitude]
  coordinates?: number[];
}

@Schema({ _id: false })
export class PricingDetails {
  @Prop({ required: true, min: 0 })
  basePrice: number; // Package price

  @Prop({ required: true, min: 0, default: 0 })
  addonsPrice: number;

  @Prop({ required: true, min: 0, default: 0 })
  extraHoursPrice: number;

  @Prop({
    type: [{ name: String, amount: Number, reason: String }],
    default: [],
  })
  surcharges: Array<{ name: string; amount: number; reason?: string }>;

  @Prop({ required: true, min: 0, default: 0 })
  surchargesPrice: number;

  @Prop({ required: true, min: 0, default: 0 })
  deliveryCharge: number;

  @Prop()
  travelDistanceKm?: number;

  @Prop()
  nearestOfficeName?: string;

  @Prop({ required: true, min: 0, default: 0 })
  deliveryDiscount: number;

  @Prop({ required: true, min: 0, default: 0 })
  discount: number;

  @Prop({ required: true, min: 0 })
  totalPrice: number;

  @Prop({ required: false, min: 0 })
  platformFee: number; // 15%

  @Prop({ required: false, min: 0 })
  sellerPayout: number; // 85%

  @Prop({ required: true, min: 0 })
  advancePaid: number; // For example 20%

  @Prop({ required: true, min: 0 })
  balanceDue: number;
}

@Schema({ timestamps: true, collection: 'bookings' })
export class Booking extends AbstractDocument {
  @Prop({ required: true, unique: true })
  bookingId: string; // e.g., BKG-2024-0001 (Acts as bookingNumber)

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  customerId: Types.ObjectId; // Acts as clientId

  @Prop({ required: true, type: Types.ObjectId, ref: 'Service' })
  serviceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Package' })
  packageId?: Types.ObjectId;

  @Prop({ required: true, enum: ['fixed', 'flexible'], default: 'fixed' })
  pricingMode: string;

  @Prop({ type: [{ name: String, price: Number }], default: [] })
  addons: Array<{ name: string; price: number }>;

  @Prop({ type: Types.ObjectId, ref: 'Seller' }) // Will be renamed to Seller later
  sellerId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  photographerId?: Types.ObjectId;

  @Prop({ enum: ['PENDING', 'PAID'], default: 'PENDING' })
  payoutStatus: string;

  @Prop({ type: Date, required: true })
  scheduledDate: Date;

  @Prop({ required: true })
  startTime: string; // e.g., "10:00"

  @Prop({ required: true })
  endTime: string; // e.g., "14:00"

  @Prop({
    required: true,
    enum: TimeFlexibility,
    default: TimeFlexibility.STRICT,
  })
  timeFlexibility: TimeFlexibility;

  @Prop({ required: true, default: 0 })
  extraHoursBooked: number;

  @Prop({ type: LocationDetails, required: true })
  location: LocationDetails;

  @Prop({ type: PricingDetails, required: true })
  pricing: PricingDetails;

  @Prop({ type: Object })
  priceSnapshot?: Record<string, any>; // Immutable copy of prices/items at confirmation time

  @Prop({
    required: true,
    enum: BookingStatus,
    default: BookingStatus.PENDING_PAYMENT,
  })
  status: BookingStatus;

  @Prop({
    type: [
      {
        status: String,
        timestamp: Date,
        note: String,
        updatedBy: { type: Types.ObjectId, ref: 'User' },
      },
    ],
    default: [],
  })
  timeline: Array<{
    status: string;
    timestamp: Date;
    note?: string;
    updatedBy?: Types.ObjectId;
  }>;

  @Prop({ type: Types.ObjectId, ref: 'Coupon' })
  appliedCouponId?: Types.ObjectId;

  @Prop()
  customerNotes?: string;

  @Prop()
  adminNotes?: string;

  @Prop()
  invoiceUrl?: string;

  @Prop()
  deliveryLink?: string; // For Google Drive / high-res link

  @Prop({ type: [{ url: String, filename: String, isWishlisted: Boolean }], default: [] })
  gallery?: Array<{ url: string; filename: string; isWishlisted: boolean }>;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
BookingSchema.index({ customerId: 1, status: 1 });
BookingSchema.index({ scheduledDate: 1 });
BookingSchema.index({ 'location.coordinates': '2dsphere' });
