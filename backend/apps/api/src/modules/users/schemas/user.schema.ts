import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';
import { Role } from '@app/auth';
import { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class User extends AbstractDocument {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: Role, default: Role.CUSTOMER })
  role: Role;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop({
    type: [
      {
        address: String,
        landmark: String,
        pincode: String,
        city: String,
        coordinates: [Number],
      },
    ],
    default: [],
  })
  savedAddresses: Array<{
    address: string;
    landmark?: string;
    pincode: string;
    city: string;
    coordinates?: number[];
  }>;

  @Prop()
  phone?: string;

  @Prop()
  profileImage?: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop({ default: false })
  isWhatsappVerified: boolean;

  @Prop({ default: 0 })
  walletBalance: number;

  @Prop({ unique: true, sparse: true })
  referralCode?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  referredBy?: Types.ObjectId;

  @Prop({ default: false })
  hasCompletedFirstBooking: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
