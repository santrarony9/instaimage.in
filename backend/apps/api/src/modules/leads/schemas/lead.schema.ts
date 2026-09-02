import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';

@Schema({ timestamps: true, collection: 'leads' })
export class Lead extends AbstractDocument {
  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ type: [{ serviceId: String, serviceName: String, basePrice: Number }] })
  wishlist: Array<{ serviceId: string; serviceName: string; basePrice: number }>;

  @Prop({ required: true })
  totalEstimatedPrice: number;

  @Prop({ enum: ['NEW', 'CONTACTED', 'CONVERTED', 'LOST'], default: 'NEW' })
  status: string;

  @Prop()
  adminNotes?: string;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
