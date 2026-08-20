import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Public } from '@app/auth';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @Post('webhook')
  async handleRazorpayWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() payload: any,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Razorpay signature');
    }

    // In a real app, verify signature using crypto and RAZORPAY_WEBHOOK_SECRET
    // const isValid = verifyWebhookSignature(payload, signature, secret);

    const event = payload.event;

    switch (event) {
      case 'payment.captured':
        // const bookingId = payload.payload.payment.entity.notes.bookingId;
        // await this.bookingsService.updateStatus(bookingId, BookingStatus.CONFIRMED);
        break;
      case 'payment.failed':
        // Handle failure
        break;
      default:
        // Ignore other events
        break;
    }

    return { received: true };
  }
}
