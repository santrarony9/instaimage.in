import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'settings' })
export class Setting extends AbstractDocument {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  value: any;

  @Prop()
  description?: string;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
