import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Headers,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PaymentsService } from './payments.service';
import { Public } from '@app/auth';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  // Webhook for asynchronous Razorpay events (e.g. payment.captured, payment.failed)
  @Public()
  @Post('webhook')
  async handleRazorpayWebhook(
    @Body() payload: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Razorpay signature');
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      // If webhook secret isn't configured, we just log and ignore for now.
      // (Primary verification happens synchronously via frontend callback)
      return { received: true };
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Process event if needed (e.g., payload.event === 'payment.captured')
    
    return { received: true };
  }
}
