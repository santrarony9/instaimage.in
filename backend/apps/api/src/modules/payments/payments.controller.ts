import {
  Controller,
  Post,
  Body,
  BadRequestException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PaymentsService } from './payments.service';
import { BookingsService } from '../bookings/bookings.service';
import { Public } from '@app/auth';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    @Inject('BookingsServiceToken') private readonly bookingsService: BookingsService,
  ) {}

  @Post('verify')
  async verifyPayment(
    @Body() payload: {
      payment_id: string;
      bookingId: string;
    }
  ) {
    const isValid = await this.paymentsService.verifyInstamojoPayment(
      payload.payment_id
    );

    if (!isValid) {
      throw new BadRequestException('Invalid or incomplete payment');
    }

    return { success: true };
  }

  @Public()
  @Post('webhook')
  async handleInstamojoWebhook(
    @Body() payload: any,
  ) {
    const mac = payload.mac;
    if (!mac) {
      throw new BadRequestException('Missing MAC signature');
    }

    const salt = process.env.INSTAMOJO_SALT;
    if (!salt) {
      throw new InternalServerErrorException('Webhook not configured');
    }

    // Instamojo MAC validation
    const data = { ...payload };
    delete data.mac;

    const keys = Object.keys(data).sort();
    const values = keys.map(k => data[k]).join('|');

    const expectedMac = crypto
      .createHmac('sha1', salt)
      .update(values)
      .digest('hex');

    if (expectedMac !== mac) {
      throw new BadRequestException('Invalid webhook MAC');
    }

    if (payload.status === 'Credit' || payload.status === 'Successful') {
      // Update booking status via bookings service
      const paymentRequestId = payload.payment_request_id;
      if (paymentRequestId) {
        try {
          await this.bookingsService.verifyPayment(paymentRequestId, {
            payment_id: payload.payment_id,
            payment_status: payload.status,
          });
        } catch (err) {
          console.error('Webhook booking update failed:', err);
        }
      }
    }

    return { received: true };
  }
}
