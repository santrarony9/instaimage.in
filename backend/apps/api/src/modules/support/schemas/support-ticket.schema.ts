import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';
import { Types } from 'mongoose';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

export enum MessageSender {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

@Schema({ _id: false, timestamps: { createdAt: true, updatedAt: false } })
export class TicketMessage {
  @Prop({ required: true, enum: MessageSender })
  sender: MessageSender;

  @Prop({ required: true })
  text: string;

  createdAt?: Date;
}

const TicketMessageSchema = SchemaFactory.createForClass(TicketMessage);

@Schema({ versionKey: false, timestamps: true })
export class SupportTicket extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true, enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Prop({ type: [TicketMessageSchema], default: [] })
  messages: TicketMessage[];
}

export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicket);
