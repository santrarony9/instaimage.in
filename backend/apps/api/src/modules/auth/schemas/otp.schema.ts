import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';

@Schema({ versionKey: false, timestamps: true })
export class Otp extends AbstractDocument {
  @Prop({ required: true, index: true })
  phone: string;

  @Prop({ required: true })
  otpHash: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: 0 })
  attempts: number;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
OtpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });
