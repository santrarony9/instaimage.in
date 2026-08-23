import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';

@Schema({ versionKey: false, timestamps: true, collection: 'categories' })
export class Category extends AbstractDocument {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop()
  image?: string;

  @Prop()
  icon?: string;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isTrending: boolean;

  @Prop()
  seoTitle?: string;

  @Prop()
  seoDescription?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
