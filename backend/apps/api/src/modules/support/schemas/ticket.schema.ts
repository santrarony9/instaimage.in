import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/database';
import { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'tickets' })
export class Ticket extends AbstractDocument {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Booking' })
  bookingId?: Types.ObjectId;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM',
  })
  priority: string;

  @Prop({
    required: true,
    enum: ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER', 'RESOLVED', 'CLOSED'],
    default: 'OPEN',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedAdmin?: Types.ObjectId;

  @Prop({
    type: [
      {
        senderId: { type: Types.ObjectId, ref: 'User' },
        message: String,
        timestamp: Date,
      },
    ],
    default: [],
  })
  messages: { senderId: Types.ObjectId; message: string; timestamp: Date }[];
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
