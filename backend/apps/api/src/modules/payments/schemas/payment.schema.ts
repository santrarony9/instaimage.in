import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';
import { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'payments' })
export class Payment extends AbstractDocument {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Booking' })
  bookingId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  clientId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: 'INR' })
  currency: string;

  @Prop()
  gateway?: string;

  @Prop()
  transactionId?: string;

  @Prop()
  paymentMethod?: string;

  @Prop({
    required: true,
    enum: [
      'PENDING',
      'AUTHORIZED',
      'PAID',
      'FAILED',
      'REFUNDED',
      'PARTIALLY_REFUNDED',
    ],
    default: 'PENDING',
  })
  status: string;

  @Prop()
  paidAt?: Date;

  @Prop({ default: 0 })
  refundAmount: number;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
