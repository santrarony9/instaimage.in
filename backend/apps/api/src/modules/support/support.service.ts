import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SupportTicket, TicketStatus, MessageSender } from './schemas/support-ticket.schema';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(SupportTicket.name) private ticketModel: Model<SupportTicket>
  ) {}

  async createTicket(userId: string, subject: string, message: string) {
    const ticket = await this.ticketModel.create({
      userId: new Types.ObjectId(userId),
      subject,
      messages: [{ sender: MessageSender.CUSTOMER, text: message }]
    });
    return ticket;
  }

  async getMyTickets(userId: string) {
    return this.ticketModel.find({ userId: new Types.ObjectId(userId) }).sort({ updatedAt: -1 }).exec();
  }

  async getTicketById(userId: string, ticketId: string) {
    const ticket = await this.ticketModel.findOne({
      _id: new Types.ObjectId(ticketId),
      userId: new Types.ObjectId(userId)
    }).exec();
    
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async replyToTicket(userId: string, ticketId: string, message: string) {
    const ticket = await this.ticketModel.findOne({
      _id: new Types.ObjectId(ticketId),
      userId: new Types.ObjectId(userId)
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    ticket.messages.push({
      sender: MessageSender.CUSTOMER,
      text: message
    });
    
    if (ticket.status === TicketStatus.RESOLVED) {
      ticket.status = TicketStatus.OPEN; // Reopen if they reply
    }

    await ticket.save();
    return ticket;
  }

  // Admin methods could go here later
}
