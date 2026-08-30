import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  private razorpay: any;

  constructor(private readonly configService: ConfigService) {
    const key_id = this.configService.get<string>('RAZORPAY_KEY_ID');
    const key_secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    
    if (key_id && key_secret) {
      const Razorpay = require('razorpay');
      this.razorpay = new Razorpay({
        key_id: key_id,
        key_secret: key_secret,
      });
      this.logger.log('Razorpay initialized');
    } else {
      this.logger.warn('Razorpay keys not found in environment. Payments will run in mock mode.');
    }
  }

  async createPaymentOrder(
    bookingId: string,
    amount: number,
    currency: string = 'INR',
  ) {
    if (this.razorpay) {
      try {
        const orderOptions = {
          amount: Math.round(amount * 100), // amount in paisa
          currency: currency,
          receipt: bookingId,
        };
        const order = await this.razorpay.orders.create(orderOptions);
        this.logger.log(`Razorpay Order created: ${order.id} for booking: ${bookingId}`);
        return order;
      } catch (err) {
        this.logger.error(`Error creating Razorpay order: ${err.message}`, err.stack);
        throw err;
      }
    } else {
      this.logger.log(
        `Mocking Razorpay Order for Booking: ${bookingId}, Amount: ${amount}`,
      );

      // Mock Razorpay order response
      return {
        id: `order_mock_${new Date().getTime()}`,
        entity: 'order',
        amount: Math.round(amount * 100),
        amount_paid: 0,
        amount_due: Math.round(amount * 100),
        currency,
        receipt: bookingId,
        status: 'created',
        attempts: 0,
      };
    }
  }

  async verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    signature: string,
  ) {
    this.logger.log(`Verifying signature for Order: ${razorpayOrderId}`);
    if (this.razorpay) {
      const crypto = require('crypto');
      const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
      
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      return generatedSignature === signature;
    } else {
      // Mock verification: always return true in development
      return true;
    }
  }
}
