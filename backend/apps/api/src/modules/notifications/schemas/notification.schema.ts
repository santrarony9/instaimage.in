import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';
import { Types, Schema as MongooseSchema } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'notifications' })
export class Notification extends AbstractDocument {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, enum: ['BOOKING', 'BOOKING_ASSIGNED', 'SYSTEM', 'PROMO'], default: 'SYSTEM' })
  type: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  link?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ isRead: 1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // TTL index: 30 days
