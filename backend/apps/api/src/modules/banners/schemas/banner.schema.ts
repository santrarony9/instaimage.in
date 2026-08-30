import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';
import { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'banners' })
export class Banner extends AbstractDocument {
  @Prop({ required: true })
  title: string;

  @Prop()
  subtitle?: string;

  @Prop()
  badgeText?: string;

  @Prop()
  type: string; // 'COMBO', 'HERO', etc.

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Service' }] })
  services: Types.ObjectId[];

  @Prop()
  originalPrice?: number;

  @Prop()
  comboPrice?: number;

  @Prop()
  time?: string;

  @Prop()
  backgroundImage?: string;

  @Prop()
  redirectUrl?: string;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
