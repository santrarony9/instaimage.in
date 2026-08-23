import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';
import { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'packages' })
export class Package extends AbstractDocument {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Service' })
  serviceId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true, default: 'HOURS' })
  durationUnit: string; // 'MINUTES', 'HOURS', 'DAYS'

  @Prop({ required: true })
  price: number;

  @Prop({ default: 1 })
  photographerCount: number;

  @Prop({ type: [String], default: [] })
  deliverables: string[];

  @Prop({ type: [String], default: [] })
  includedItems: string[];

  @Prop({ type: [String], default: [] })
  excludedItems: string[];

  @Prop({ default: false })
  popular: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const PackageSchema = SchemaFactory.createForClass(Package);
