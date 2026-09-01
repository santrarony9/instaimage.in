import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';
import { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class VerificationCoupon extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ default: false })
  isRedeemed: boolean;

  @Prop({ required: true })
  expiresAt: Date;
}

export const VerificationCouponSchema =
  SchemaFactory.createForClass(VerificationCoupon);
