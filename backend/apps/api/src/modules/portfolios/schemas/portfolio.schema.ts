import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';
import { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'portfolios' })
export class Portfolio extends AbstractDocument {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Creator' }) // Seller
  sellerId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  categoryId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service' })
  serviceId?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  location?: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  videos: string[];

  @Prop({ default: false })
  featured: boolean;

  @Prop({
    required: true,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  })
  status: string;
}

export const PortfolioSchema = SchemaFactory.createForClass(Portfolio);
