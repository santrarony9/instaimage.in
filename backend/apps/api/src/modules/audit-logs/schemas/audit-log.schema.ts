import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';
import { Types, Schema as MongooseSchema } from 'mongoose';

@Schema({
  versionKey: false,
  timestamps: { createdAt: 'timestamp', updatedAt: false },
  collection: 'audit_logs',
})
export class AuditLog extends AbstractDocument {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  entity: string;

  @Prop({ required: true })
  entityId: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  oldValue?: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  newValue?: any;

  @Prop()
  ip?: string;

  // timestamp is handled by Mongoose via timestamps options mapped to createdAt
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
