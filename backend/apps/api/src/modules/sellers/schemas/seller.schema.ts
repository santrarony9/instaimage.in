import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';
import { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'sellers' }) // Collection will be renamed to sellers in Batch 3
export class Seller extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ required: true })
  bankDetails: string;

  @Prop({ default: true })
  isActive: boolean;

  // New Seller Fields added in Batch 1
  @Prop({ enum: ['IN_HOUSE', 'PARTNER'], default: 'IN_HOUSE' })
  sellerType: string;

  @Prop({
    enum: ['PENDING', 'VERIFIED', 'SUSPENDED', 'REJECTED', 'INACTIVE'],
    default: 'PENDING',
  })
  status: string;

  @Prop()
  profilePhoto?: string;

  @Prop()
  coverPhoto?: string;

  @Prop()
  experience?: string;

  @Prop({ type: [String], default: [] })
  specializations: string[];

  @Prop({ type: [String], default: [] })
  photographyStyles: string[];

  @Prop({ type: [String], default: [] })
  serviceAreas: string[];

  @Prop({ type: [String], default: [] })
  equipment: string[];

  @Prop({ type: [String], default: [] })
  verificationDocuments: string[];

  @Prop({ default: 15 })
  commissionRate: number; // Platform fee percentage (e.g. 15%)
}

export const SellerSchema = SchemaFactory.createForClass(Seller);
