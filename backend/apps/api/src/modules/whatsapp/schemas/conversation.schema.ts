import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ _id: false })
export class MessageItem {
  @Prop({ required: true })
  messageId: string;

  @Prop({ required: true, enum: ['INCOMING', 'OUTGOING'] })
  direction: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: 'text' })
  type: string;

  @Prop({ required: true, default: Date.now })
  timestamp: Date;
  
  @Prop({ default: 'delivered' })
  status: string; // sent, delivered, read (for OUTGOING)
}

const MessageItemSchema = SchemaFactory.createForClass(MessageItem);

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true, unique: true, index: true })
  phone: string;

  @Prop()
  customerName: string;

  @Prop({ type: [MessageItemSchema], default: [] })
  messages: MessageItem[];

  @Prop({ default: 0 })
  unreadCount: number;

  @Prop()
  lastMessageAt: Date;
  
  @Prop()
  lastMessagePreview: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
