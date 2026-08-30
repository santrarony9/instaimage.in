import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {}

  async sendBookingConfirmationEmail(
    email: string,
    bookingId: string,
    name: string,
  ) {
    this.logger.log(
      `Queueing confirmation email for ${email} - Booking ${bookingId}`,
    );

    await this.notificationsQueue.add(
      'send-email',
      {
        type: 'BOOKING_CONFIRMATION',
        to: email,
        payload: { bookingId, name },
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    );
  }

  async sendPhotographerAssignmentSMS(
    phone: string,
    bookingId: string,
    date: string,
    location: string,
  ) {
    this.logger.log(
      `Queueing SMS assignment for ${phone} - Booking ${bookingId}`,
    );

    await this.notificationsQueue.add(
      'send-sms',
      {
        type: 'PHOTOGRAPHER_ASSIGNMENT',
        to: phone,
        payload: { bookingId, date, location },
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );
  }

  async sendBookingConfirmationWhatsApp(
    phone: string,
    customerName: string,
    bookingId: string,
    date: string,
  ) {
    this.logger.log(
      `Queueing WhatsApp confirmation for ${phone} - Booking ${bookingId}`,
    );

    await this.notificationsQueue.add(
      'send-whatsapp',
      {
        type: 'BOOKING_CONFIRMATION',
        to: phone,
        templateName: 'booking_confirmation_alert',
        parameters: [customerName, `#${bookingId}`, date],
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    );
  }
}
