import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private razorpay: any;

  constructor(private readonly configService: ConfigService) {
    const rzpKeyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const rzpSecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (rzpKeyId && rzpSecret) {
      const Razorpay = require('razorpay');
      this.razorpay = new Razorpay({
        key_id: rzpKeyId,
        key_secret: rzpSecret,
      });
      this.logger.log('Razorpay payment gateway initialized successfully.');
    } else {
      this.logger.error('CRITICAL: Razorpay keys not found in environment variables. Payments will fail.');
    }
  }

  async createPaymentOrder(
    bookingId: string,
    amount: number,
    currency: string = 'INR',
  ) {
    if (!this.razorpay) {
      throw new InternalServerErrorException('Payment gateway is not configured.');
    }

    try {
      const options = {
        amount: Math.round(amount * 100), // convert to paise
        currency: currency,
        receipt: bookingId,
        payment_capture: 1 // Auto capture
      };

      const order = await this.razorpay.orders.create(options);
      this.logger.log(`Razorpay Order created: ${order.id} for booking: ${bookingId}`);
      
      return {
        id: order.id,
        amount: amount,
        currency: currency,
        provider: 'razorpay'
      };
    } catch (err) {
      this.logger.error(`Error creating Razorpay order: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Failed to create payment order with Razorpay.');
    }
  }

  verifyRazorpaySignature(razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string): boolean {
    const key_secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    if (!key_secret) return false;
    
    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');
    
    return generatedSignature === razorpay_signature;
  }
}
