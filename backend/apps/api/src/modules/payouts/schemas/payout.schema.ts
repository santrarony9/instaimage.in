import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';
import { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'payouts' })
export class Payout extends AbstractDocument {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Creator' }) // Seller
  sellerId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Booking' })
  bookingId: Types.ObjectId;

  @Prop({ required: true })
  grossAmount: number;

  @Prop({ required: true })
  commission: number;

  @Prop({ default: 0 })
  adjustments: number;

  @Prop({ default: 0 })
  tax: number;

  @Prop({ required: true })
  netPayout: number;

  @Prop({
    required: true,
    enum: ['PENDING', 'PROCESSING', 'PAID', 'FAILED', 'ON_HOLD'],
    default: 'PENDING',
  })
  status: string;

  @Prop()
  payoutDate?: Date;

  @Prop()
  transactionReference?: string;
}

export const PayoutSchema = SchemaFactory.createForClass(Payout);
