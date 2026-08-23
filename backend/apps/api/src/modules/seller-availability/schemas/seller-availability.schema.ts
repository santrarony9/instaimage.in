import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';
import { Types } from 'mongoose';

@Schema({
  versionKey: false,
  timestamps: true,
  collection: 'seller_availability',
})
export class SellerAvailability extends AbstractDocument {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Creator' }) // Seller
  sellerId: Types.ObjectId;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({
    required: true,
    enum: ['AVAILABLE', 'UNAVAILABLE', 'LEAVE', 'BUSY'],
    default: 'AVAILABLE',
  })
  status: string;

  @Prop({ type: [String], default: [] })
  timeSlots: string[];

  @Prop({ default: false })
  overriddenByAdmin: boolean;
}

export const SellerAvailabilitySchema =
  SchemaFactory.createForClass(SellerAvailability);
