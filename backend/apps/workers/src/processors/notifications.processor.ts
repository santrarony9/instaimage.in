import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(
      `Processing job ${job.id} of type ${job.name} with data: ${JSON.stringify(job.data)}`,
    );

    switch (job.name) {
      case 'send-email':
        await this.handleSendEmail(job.data);
        break;
      case 'send-sms':
        await this.handleSendSms(job.data);
        break;
      case 'send-whatsapp':
        await this.handleSendWhatsApp(job.data);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }

    return { status: 'completed' };
  }

  private async handleSendEmail(data: any) {
    this.logger.log(`[MOCK] Sending email to ${data.to} | Type: ${data.type}`);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.logger.log(`[MOCK] Email sent successfully to ${data.to}`);
  }

  private async handleSendSms(data: any) {
    this.logger.log(`[MOCK] Sending SMS to ${data.to} | Type: ${data.type}`);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    this.logger.log(`[MOCK] SMS sent successfully to ${data.to}`);
  }

  private async handleSendWhatsApp(data: {
    to: string;
    templateName: string;
    parameters: string[];
    languageCode?: string;
  }) {
    const phoneNumberId =
      process.env.WHATSAPP_PHONE_NUMBER_ID || '1302518772938870';
    const accessToken =
      process.env.WHATSAPP_ACCESS_TOKEN ||
      'EAAPBkN377kUBSSPqwVDOjn4UaXp8N7V82xCdgEqjI1L8aoWQUDUXGRvPzGpsvgWzSDoKD0Sc27oKVyi0wJOxkdIpZAhgyRdX6Bo8cOB2kVWs3TYzACAo9jHVMMCJV0AVw1j6YgZAfhjCA5t2936zcb8ZBfhm2Tk96NYJ8WUUBNhJhRfIxFWCyOmZBhxC6QZDZD';
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v20.0';

    let cleaned = data.to.replace(/\D/g, '');
    if (cleaned.length === 10) {
      cleaned = `91${cleaned}`;
    }

    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

    const components: any[] = [];
    if (data.parameters && data.parameters.length > 0) {
      components.push({
        type: 'body',
        parameters: data.parameters.map((param) => ({
          type: 'text',
          text: String(param),
        })),
      });
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleaned,
      type: 'template',
      template: {
        name: data.templateName,
        language: { code: data.languageCode || 'en_US' },
        ...(components.length > 0 ? { components } : {}),
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok) {
        this.logger.error(
          `WhatsApp Worker Error for ${cleaned}: ${JSON.stringify(resData)}`,
        );
        throw new Error(`WhatsApp API Error: ${JSON.stringify(resData)}`);
      }

      this.logger.log(
        `WhatsApp sent successfully to ${cleaned}: ${resData.messages?.[0]?.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process WhatsApp job for ${cleaned}:`,
        error.message,
      );
      throw error;
    }
  }
}
