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
            
            <div style="background: linear-gradient(135deg, #1e3a8a, #4f46e5); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0;">
              <h3 style="margin-top: 0; font-size: 24px; font-weight: 900;">YOUR EXCLUSIVE WELCOME GIFT! 🎁</h3>
              <p style="font-size: 16px; margin-bottom: 20px;">As a thank you for joining us, enjoy ₹500 OFF your first booking!</p>
              
              <div style="background-color: white; color: #1e3a8a; padding: 15px; border-radius: 8px; font-size: 28px; font-weight: 900; letter-spacing: 2px; margin: 0 auto; width: fit-content; border: 2px dashed #4f46e5;">
                WELCOME500
              </div>
              
              <p style="font-size: 12px; margin-top: 15px; opacity: 0.8;">*Valid on minimum purchase value of ₹5,000.</p>
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
