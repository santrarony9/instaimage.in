import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingsRepository } from './bookings.repository';
import { EmailService } from '../email/email.service';
import { BookingStatus } from './schemas/booking.schema';

@Injectable()
export class BookingsCronService {
  private readonly logger = new Logger(BookingsCronService.name);

  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly emailService: EmailService,
  ) {}

  @Cron('*/10 * * * *') // Run every 10 minutes
  async handleAbandonedCheckouts() {
    this.logger.log('Checking for abandoned checkouts...');
    const now = new Date();
    // Find bookings created between 30 and 45 minutes ago that are still PENDING_PAYMENT
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000);
    const fortyFiveMinutesAgo = new Date(now.getTime() - 45 * 60000);

    const abandonedBookings = await this.bookingsRepository.model
      .find({
        status: BookingStatus.PENDING_PAYMENT,
        createdAt: {
          $lte: thirtyMinutesAgo,
          $gte: fortyFiveMinutesAgo,
        },
        recoveryEmailSent: { $ne: true },
      })
      .populate('customerId', 'name email')
      .populate('serviceId', 'name title');

    for (const booking of abandonedBookings) {
      const customer = booking.customerId as unknown as { email: string; name: string };
      const service = booking.serviceId as unknown as { title?: string; name?: string };

      if (customer && customer.email) {
        this.logger.log(
          `Sending recovery email for booking ${booking.bookingId}`,
        );
        await this.emailService.sendAbandonedCheckoutEmail(
          customer.email,
          customer.name,
          service?.title || service?.name || 'your selected service',
          booking.pricing.balanceDue + booking.pricing.advancePaid,
        );

        // Mark as sent
        await this.bookingsRepository.update(booking._id.toString(), {
          recoveryEmailSent: true,
        });
      }
    }
  }
}
