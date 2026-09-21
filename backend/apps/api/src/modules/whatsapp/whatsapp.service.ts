import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  private readonly phoneNumberId: string;
  private readonly accessToken: string;
  private readonly apiVersion: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>,
  ) {
    this.phoneNumberId =
      this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID') ||
      '1302518772938870';
    this.accessToken =
      this.configService.get<string>('WHATSAPP_ACCESS_TOKEN') || '';
    if (!this.accessToken) {
      this.logger.warn('WHATSAPP_ACCESS_TOKEN is not set — WhatsApp messages will fail');
    }
    this.apiVersion =
      this.configService.get<string>('WHATSAPP_API_VERSION') || 'v20.0';
  }

  /**
   * Format phone number to international E.164 digits without '+' (e.g., 919876543210)
   */
  private formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      cleaned = `91${cleaned}`;
    }
    return cleaned;
  }

  /**
   * Send pre-approved Meta Template Message
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    parameters: string[] = [],
    languageCode: string = 'en_US',
  ): Promise<any> {
    const formattedPhone = this.formatPhoneNumber(to);
    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

    const components: any[] = [];
    if (parameters.length > 0) {
      components.push({
        type: 'body',
        parameters: parameters.map((param) => ({
          type: 'text',
          text: String(param),
        })),
      });
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
        ...(components.length > 0 ? { components } : {}),
      },
    };

    try {
      this.logger.log(
        `Sending WhatsApp template [${templateName}] to ${formattedPhone}`,
      );

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.error(
          `WhatsApp Cloud API Error for ${formattedPhone}: ${JSON.stringify(data)}`,
        );
        return { success: false, error: data };
      }

      this.logger.log(
        `WhatsApp template sent to ${formattedPhone} (Message ID: ${data.messages?.[0]?.id})`,
      );
      return { success: true, messageId: data.messages?.[0]?.id };
    } catch (error) {
      this.logger.error(
        `Failed to send WhatsApp message to ${formattedPhone}:`,
        error,
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Send plain text message (Only works within 24hr customer support window)
   */
  async sendTextMessage(to: string, text: string): Promise<any> {
    const formattedPhone = this.formatPhoneNumber(to);
    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: text,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.error(
          `WhatsApp text error for ${formattedPhone}: ${JSON.stringify(data)}`,
        );
        return { success: false, error: data };
      }

      return { success: true, messageId: data.messages?.[0]?.id };
    } catch (error) {
      this.logger.error(
        `Failed to send WhatsApp text to ${formattedPhone}:`,
        error,
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Send Booking Confirmation Alert
   */
  async sendBookingConfirmation(
    to: string,
    customerName: string,
    bookingId: string,
    date: string,
  ) {
    return this.sendTemplateMessage(
      to,
      'booking_confirmation_alert',
      [customerName, `#${bookingId}`, date],
      'en_US',
    );
  }

  /**
   * Send OTP Verification Message
   */
  async sendOtpMessage(to: string, otp: string, customerName: string = 'User') {
    return this.sendTemplateMessage(
      to,
      'instaimage_promo_code',
      [otp],
      'en_US',
    );
  }
  
  /**
   * Handle incoming message from Meta Webhook
   */
  async handleIncomingWebhookMessage(phone: string, name: string, messageObj: any) {
    const formattedPhone = this.formatPhoneNumber(phone);
    const content = messageObj.text?.body || `[Received ${messageObj.type} message]`;
    
    const message = {
      messageId: messageObj.id,
      direction: 'INCOMING',
      content,
      type: messageObj.type,
      timestamp: new Date(messageObj.timestamp * 1000),
      status: 'delivered',
    };

    await this.conversationModel.findOneAndUpdate(
      { phone: formattedPhone },
      {
        $setOnInsert: { customerName: name },
        $push: { messages: message },
        $inc: { unreadCount: 1 },
        $set: {
          lastMessageAt: new Date(messageObj.timestamp * 1000),
          lastMessagePreview: content.substring(0, 50),
        }
      },
      { upsert: true, new: true }
    );
    this.logger.log(`Received incoming WhatsApp message from ${formattedPhone}`);
  }

  /**
   * Fetch conversations for Admin Dashboard
   */
  async getConversations() {
    return this.conversationModel.find().sort({ lastMessageAt: -1 }).exec();
  }

  /**
   * Admin Dashboard manual reply
   */
  async sendManualReply(phone: string, text: string) {
    const response = await this.sendTextMessage(phone, text);
    
    if (response.success) {
      const message = {
        messageId: response.messageId,
        direction: 'OUTGOING',
        content: text,
        type: 'text',
        timestamp: new Date(),
        status: 'sent',
      };

      await this.conversationModel.findOneAndUpdate(
        { phone },
        {
          $push: { messages: message },
          $set: {
            lastMessageAt: new Date(),
            lastMessagePreview: text.substring(0, 50),
          }
        },
        { upsert: true }
      );
    }
    return response;
  }

  /**
   * Mark conversation as read
   */
  async markConversationAsRead(phone: string) {
    return this.conversationModel.findOneAndUpdate(
      { phone },
      { $set: { unreadCount: 0 } },
      { new: true }
    );
  }
}
