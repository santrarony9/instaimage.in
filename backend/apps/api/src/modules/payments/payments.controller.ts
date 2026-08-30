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

  @Post('verify')
  async verifyPayment(
    @Body() payload: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      bookingId: string;
    }
  ) {
    const isValid = await this.paymentsService.verifyPaymentSignature(
      payload.razorpay_order_id,
      payload.razorpay_payment_id,
      payload.razorpay_signature
    );

    if (!isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    // Usually you would also update the booking status to PAID or CONFIRMED here.
    // For now we just return success so frontend knows it's verified.
    return { success: true };
  }

  @Public()
  @Post('webhook')
  async handleRazorpayWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() payload: any,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Razorpay signature');
    }

    const crypto = require('crypto');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'fallback_secret';

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

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
