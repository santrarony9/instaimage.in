import {
  Controller,
  Post,
  Body,
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

    const crypto = require('crypto');
    const salt = process.env.INSTAMOJO_SALT || '';

    // Instamojo MAC generation logic:
    // Sort keys, concatenate values with pipe, generate HMAC SHA1 using salt
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
        // Handle success
        // e.g. update booking status
    } else {
        // Handle failure
    }

    return { received: true };
  }
}
