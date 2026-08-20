import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  // In a real scenario, this would be an initialized razorpay instance
  // private razorpay: Razorpay;

  constructor(private readonly configService: ConfigService) {
    /*
    this.razorpay = new Razorpay({
      key_id: configService.get<string>('RAZORPAY_KEY_ID'),
      key_secret: configService.get<string>('RAZORPAY_KEY_SECRET'),
    });
    */
  }

  async createPaymentOrder(
    bookingId: string,
    amount: number,
    currency: string = 'INR',
  ) {
    this.logger.log(
      `Mocking Razorpay Order for Booking: ${bookingId}, Amount: ${amount}`,
    );

    // Mock Razorpay order response
    return {
      id: `order_mock_${new Date().getTime()}`,
      entity: 'order',
      amount: amount * 100, // Razorpay takes amounts in paisa
      amount_paid: 0,
      amount_due: amount * 100,
      currency,
      receipt: bookingId,
      status: 'created',
      attempts: 0,
    };
  }

  async verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    signature: string,
  ) {
    this.logger.log(`Verifying signature for Order: ${razorpayOrderId}`);
    // Mock verification: always return true in development
    return true;
  }
}
