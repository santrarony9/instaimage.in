import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private apiKey: string | undefined;
  private authToken: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('INSTAMOJO_API_KEY');
    this.authToken = this.configService.get<string>('INSTAMOJO_AUTH_TOKEN');
    
    if (this.apiKey && this.authToken) {
      this.logger.log('Instamojo keys found in environment. Initialized.');
    } else {
      this.logger.warn('Instamojo keys not found in environment. Payments will run in mock mode.');
    }
  }

  async createPaymentOrder(
    bookingId: string,
    amount: number,
    currency: string = 'INR',
  ) {
    if (this.apiKey && this.authToken) {
      try {
        // Build the callback URL (adjust domain based on environment)
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://instaimage.in';
        const redirectUrl = `${frontendUrl}/booking/callback?bookingId=${bookingId}`;

        const payload = new URLSearchParams({
          purpose: `Booking ${bookingId}`,
          amount: amount.toString(),
          buyer_name: 'Customer', // We can enhance this if customer name is passed, but generic is fine for Instamojo
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
        
        // Match the return structure expected by the frontend
        return {
          id: data.payment_request.id,
          amount: amount,
          currency: currency,
          longurl: data.payment_request.longurl,
        };
      } catch (err) {
        this.logger.error(`Error creating Instamojo payment request: ${err.message}`, err.stack);
        throw err;
      }
    } else {
      this.logger.log(`Mocking Instamojo Order for Booking: ${bookingId}, Amount: ${amount}`);
      
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://instaimage.in';

      return {
        id: `order_mock_${new Date().getTime()}`,
        amount: amount,
        currency,
        longurl: `${frontendUrl}/booking/callback?payment_id=mock_payment_${new Date().getTime()}&payment_status=Credit&payment_request_id=mock_req&bookingId=${bookingId}`,
      };
    }
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
