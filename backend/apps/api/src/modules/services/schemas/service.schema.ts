import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';
import { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'services' })
export class Service extends AbstractDocument {
  @Prop()
  sku?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  shortDescription?: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    required: true,
    enum: [
      'STARTING_FROM',
      'FIXED',
      'HOURLY',
      'HALF_DAY',
      'FULL_DAY',
      'CUSTOM_QUOTE',
    ],
    default: 'FIXED',
  })
  priceType: string;

  @Prop({ required: true })
  basePrice: number;

  @Prop({ required: true, default: 'INR' })
  currency: string;

  @Prop({ default: false })
  gstApplicable: boolean;

  @Prop({ default: 0 })
  gstPercentage: number;

  @Prop()
  extraHourPrice?: number;

  @Prop()
  flexiblePrice?: number;

  @Prop()
  duration?: number;

  @Prop({ default: 'HOURS' })
  durationUnit?: string;

  @Prop()
  minimumDuration?: number;

  @Prop()
  deliveryTime?: string;

  @Prop({ default: 1 })
  numberOfPhotographers: number;

  @Prop({ default: 1 })
  numberOfCameras: number;

  @Prop()
  coverImage?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop()
  videoUrl?: string;

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    default: [],
  })
  addons: { name: string; price: number }[]; // Keeping legacy addon array for now during migration

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  categoryId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subcategory' })
  subcategoryId?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  locations: string[];

  @Prop({ type: [String], default: [] })
  occasions: string[];

  @Prop({ type: Types.ObjectId, ref: 'Creator' })
  creatorId?: Types.ObjectId; // Reference to Creator/Seller

  @Prop({ default: false })
  isApproved: boolean;

  @Prop({ default: false })
  featured: boolean;

  @Prop({ default: false })
  popular: boolean;

  @Prop({ default: false })
  newService: boolean;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  reviewCount: number;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
