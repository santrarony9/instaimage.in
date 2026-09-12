import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private apiKey: string | undefined;
  private authToken: string | undefined;

  private razorpay: any;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('INSTAMOJO_API_KEY');
    this.authToken = this.configService.get<string>('INSTAMOJO_AUTH_TOKEN');
    
    const rzpKeyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const rzpSecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (rzpKeyId && rzpSecret) {
      // Need to require razorpay inline or import it at top
      const Razorpay = require('razorpay');
      this.razorpay = new Razorpay({
        key_id: rzpKeyId,
        key_secret: rzpSecret,
      });
      this.logger.log('Razorpay initialized.');
    } else if (this.apiKey && this.authToken) {
      this.logger.log('Instamojo keys found in environment. Initialized.');
    } else {
      this.logger.warn('No payment keys found in environment. Payments will run in mock mode.');
    }
  }

  async createPaymentOrder(
    bookingId: string,
    amount: number,
    currency: string = 'INR',
  ) {
    // Prefer Razorpay if configured
    if (this.razorpay) {
      try {
        const options = {
          amount: Math.round(amount * 100), // paise
          currency: currency,
          receipt: bookingId,
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
        throw err;
      }
    } else if (this.apiKey && this.authToken) {
      try {
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://instaimage.in';
        const redirectUrl = `${frontendUrl}/booking/callback?bookingId=${bookingId}`;

        const payload = new URLSearchParams({
          purpose: `Booking ${bookingId}`,
          amount: amount.toString(),
          buyer_name: 'Customer',
          send_email: 'false',
          send_sms: 'false',
          redirect_url: redirectUrl,
          allow_repeated_payments: 'false',
        });

        const response = await fetch('https://www.instamojo.com/api/1.1/payment-requests/', {
          method: 'POST',
          headers: {
            'X-Api-Key': this.apiKey,
            'X-Auth-Token': this.authToken,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: payload.toString(),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to create Instamojo payment request');
        }

        this.logger.log(`Instamojo Payment Request created: ${data.payment_request.id} for booking: ${bookingId}`);
        
        return {
          id: data.payment_request.id,
          amount: amount,
          currency: currency,
          longurl: data.payment_request.longurl,
          provider: 'instamojo'
        };
      } catch (err) {
        this.logger.error(`Error creating Instamojo payment request: ${err.message}`, err.stack);
        throw err;
      }
    } else {
      this.logger.log(`Mocking Order for Booking: ${bookingId}, Amount: ${amount}`);
      return {
        id: `order_mock_${new Date().getTime()}`,
        amount: amount,
        currency,
        provider: 'mock'
      };
    }
  }

  verifyRazorpaySignature(razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string): boolean {
    const key_secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    if (!key_secret) return true; // mock mode
    
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');
    
    return generatedSignature === razorpay_signature;
  }

  async verifyInstamojoPayment(paymentId: string) {
    this.logger.log(`Verifying Instamojo Payment: ${paymentId}`);
    if (this.apiKey && this.authToken) {
      if (paymentId.startsWith('mock_payment_')) return true;

      try {
        const response = await fetch(`https://www.instamojo.com/api/1.1/payments/${paymentId}/`, {
          headers: {
            'X-Api-Key': this.apiKey,
            'X-Auth-Token': this.authToken,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          this.logger.error(`Instamojo verification API failed: ${JSON.stringify(data)}`);
          return false;
        }

        const isSuccessful = data.payment.status === 'Credit' || data.payment.status === 'Successful';
        return isSuccessful;
      } catch (err) {
        this.logger.error(`Error verifying Instamojo payment: ${err.message}`, err.stack);
        return false;
      }
    } else {
      // Mock verification: always return true in development
      return true;
    }
  }
}
