import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';
import { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'addons' })
export class Addon extends AbstractDocument {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  price: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }], default: [] })
  applicableCategories: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;
}

export const AddonSchema = SchemaFactory.createForClass(Addon);
