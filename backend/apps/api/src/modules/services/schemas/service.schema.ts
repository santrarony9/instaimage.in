import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';

@Schema({ versionKey: false, timestamps: true })
export class Service extends AbstractDocument {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  basePrice: number;

  @Prop()
  extraHourPrice?: number;

  @Prop()
  flexiblePrice?: number;

  @Prop()
  coverImage: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop()
  videoUrl?: string;

  @Prop({
    type: [{
      name: { type: String, required: true },
      price: { type: Number, required: true }
    }],
    default: []
  })
  addons: { name: string; price: number }[];
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
