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
}
