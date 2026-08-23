import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';
import { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'reviews' })
export class Review extends AbstractDocument {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Booking' })
  bookingId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  clientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Creator' }) // Will be renamed to Seller later
  sellerId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service' })
  serviceId?: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop()
  reviewText?: string;

  @Prop({ type: [String], default: [] })
  photos: string[];

  @Prop({
    required: true,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  })
  status: string;

  @Prop()
  adminResponse?: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
