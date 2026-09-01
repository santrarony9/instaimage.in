import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail = 'InstaImage <info@instaimage.in>';

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not set — emails will not be sent');
    }
    this.resend = new Resend(apiKey || '');
  }

  async sendWelcomeEmail(to: string, name: string) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Welcome to InstaImage! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="text-align: center; padding: 20px;">
              <h2>Welcome to InstaImage, ${name}! 🎉</h2>
              <p>We are thrilled to have you on board. You can now easily book the best photographers and post-production experts directly from our platform.</p>
            </div>
            
            <div style="text-align: center; padding: 20px;">
              <p>Ready to capture some memories?</p>
              <a href="https://instaimage.in/services" style="display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0;">Explore Services</a>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="text-align: center; font-size: 14px; color: #666;">
              Best regards,<br/>
              <strong>The InstaImage Team</strong>
            </p>
          </div>
        `,
      });
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}:`, error);
    }
  }

  async sendVerificationCouponEmail(to: string, name: string, code: string) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: '🎉 Your ₹500 Verification Bonus — InstaImage',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background: #f9fafb; padding: 20px;">
            <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #059669, #0d9488); padding: 32px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 8px;">🎉</div>
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 900;">You earned ₹500!</h1>
                <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 16px;">Thank you for verifying your email, ${name}.</p>
              </div>

              <!-- Body -->
              <div style="padding: 32px; text-align: center;">
                <p style="color: #6b7280; font-size: 15px; margin-bottom: 24px;">
                  Your exclusive verification bonus is ready! Enter this code in your InstaImage dashboard to add <strong style="color: #059669;">₹500</strong> to your wallet.
                </p>

                <!-- Coupon Code Box -->
                <div style="background: linear-gradient(135deg, #ecfdf5, #d1fae5); border: 2px dashed #10b981; border-radius: 12px; padding: 24px; margin: 0 auto 24px; max-width: 320px;">
                  <p style="color: #065f46; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px;">Your Coupon Code</p>
                  <div style="background: white; border-radius: 8px; padding: 16px; font-size: 28px; font-weight: 900; letter-spacing: 4px; color: #065f46; font-family: monospace; border: 1px solid #a7f3d0;">
                    ${code}
                  </div>
                  <p style="color: #6b7280; font-size: 11px; margin: 10px 0 0;">Valid for 7 days · One-time use only</p>
                </div>

                <!-- CTA -->
                <a href="https://instaimage.in/customer" 
                   style="display: inline-block; padding: 14px 32px; background: #000; color: #fff; text-decoration: none; border-radius: 10px; font-weight: 900; font-size: 15px; margin-bottom: 16px;">
                  Claim in Dashboard →
                </a>

                <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">
                  Go to Dashboard → enter your code → ₹500 added instantly to your wallet.
                </p>
              </div>

              <!-- Footer -->
              <div style="border-top: 1px solid #f3f4f6; padding: 20px; text-align: center; background: #f9fafb;">
                <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                  This code is linked to your account and can only be redeemed once.<br/>
                  If you didn't request this, please ignore this email.
                </p>
                <p style="color: #9ca3af; font-size: 13px; margin: 12px 0 0;">
                  — <strong>The InstaImage Team</strong>
                </p>
              </div>
            </div>
          </div>
        `,
      });
      this.logger.log(`Verification coupon email sent to ${to} with code ${code}`);
    } catch (error) {
      this.logger.error(`Failed to send verification coupon email to ${to}:`, error);
    }
  }


  async sendPasswordResetEmail(to: string, resetLink: string) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Reset Your Password - InstaImage',
        html: `
          <div style="font-family: Arial, sans-serif; max-w-md; margin: 0 auto; color: #333;">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password. Click the button below to set a new one:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Reset Password</a>
            <p>If you did not request this, you can safely ignore this email.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>The InstaImage Team</strong></p>
          </div>
        `,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}:`, error);
    }
  }

  async sendBookingConfirmation(
    to: string,
    customerName: string,
    serviceTitle: string,
    date: string,
  ) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Booking Confirmed! - InstaImage',
        html: `
          <div style="font-family: Arial, sans-serif; max-w-md; margin: 0 auto; color: #333;">
            <h2>Booking Confirmed!</h2>
            <p>Hi ${customerName},</p>
            <p>Your booking for <strong>${serviceTitle}</strong> on <strong>${date}</strong> has been confirmed.</p>
            <p>You can view the full details of your booking by logging into your dashboard.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>The InstaImage Team</strong></p>
          </div>
        `,
      });
      this.logger.log(`Booking confirmation sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send booking confirmation to ${to}:`, error);
    }
  }

  async sendBookingAlert(
    sellerEmail: string,
    sellerName: string,
    serviceTitle: string,
    date: string,
  ) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: sellerEmail,
        subject: 'New Booking Received! - InstaImage',
        html: `
          <div style="font-family: Arial, sans-serif; max-w-md; margin: 0 auto; color: #333;">
            <h2>You have a new booking! 🎉</h2>
            <p>Hi ${sellerName},</p>
            <p>You just received a new booking for <strong>${serviceTitle}</strong> scheduled for <strong>${date}</strong>.</p>
            <p>Please log in to your Seller Dashboard to view the customer details and accept the booking.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>The InstaImage Team</strong></p>
          </div>
        `,
      });
      this.logger.log(`Booking alert sent to ${sellerEmail}`);
    } catch (error) {
      this.logger.error(
        `Failed to send booking alert to ${sellerEmail}:`,
        error,
      );
    }
  }

  async sendAbandonedCheckoutEmail(
    to: string,
    name: string,
    serviceName: string,
    totalAmount: number,
  ) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Complete your booking before you lose your slot! ⏳',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="text-align: center; padding: 20px;">
              <h2>Hi ${name}, you forgot something!</h2>
              <p>We noticed you started booking <strong>${serviceName}</strong> but didn't complete the payment.</p>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="margin-top: 0; color: #dc2626;">Don't lose your time slot!</h3>
              <p>Our top professionals get booked fast. Complete your 20% advance payment now to secure your booking.</p>
              <br/>
              <p style="font-weight: bold; color: #166534;">💰 P.S. Don't forget you can apply your InstaImage Wallet balance during checkout!</p>
            </div>

            <div style="text-align: center; padding: 20px;">
              <a href="https://instaimage.in/customer/bookings" style="display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0;">Resume Booking</a>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="text-align: center; font-size: 14px; color: #666;">
              Best regards,<br/>
              <strong>The InstaImage Team</strong>
            </p>
          </div>
        `,
      });
      this.logger.log(`Abandoned checkout email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send abandoned checkout email to ${to}:`,
        error,
      );
    }
  }
}
