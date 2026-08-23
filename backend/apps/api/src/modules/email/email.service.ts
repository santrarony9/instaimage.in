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
          <div style="font-family: Arial, sans-serif; max-w-md; margin: 0 auto; color: #333;">
            <h2>Welcome to InstaImage, ${name}!</h2>
            <p>We are thrilled to have you on board. You can now easily book the best photographers and post-production experts directly from our platform.</p>
            <p>If you have any questions, simply reply to this email!</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>The InstaImage Team</strong></p>
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

  async sendBookingConfirmation(to: string, customerName: string, serviceTitle: string, date: string) {
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

  async sendBookingAlert(sellerEmail: string, sellerName: string, serviceTitle: string, date: string) {
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
      this.logger.error(`Failed to send booking alert to ${sellerEmail}:`, error);
    }
  }
}
