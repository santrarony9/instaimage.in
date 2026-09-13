import { Controller, Get, Post, Body, Query, Res, HttpStatus, UseGuards, Param } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { Response } from 'express';
import { JwtAuthGuard, RolesGuard, Roles, Role, Public } from '@app/auth';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  // 1. Webhook Verification (Meta requires this)
  @Public()
  @Get('webhook')
  verifyWebhook(@Query() query: any, @Res() res: Response) {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'instaimage_secret_webhook_token';

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        return res.status(HttpStatus.OK).send(challenge);
      } else {
        return res.sendStatus(HttpStatus.FORBIDDEN);
      }
    }
    return res.sendStatus(HttpStatus.BAD_REQUEST);
  }

  // 2. Webhook Message Receiver
  @Public()
  @Post('webhook')
  async handleIncomingMessage(@Body() body: any, @Res() res: Response) {
    // Return 200 OK immediately to acknowledge receipt to Meta
    res.sendStatus(HttpStatus.OK);

    try {
      if (body.object) {
        if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
          const phoneNumber = body.entry[0].changes[0].value.contacts?.[0]?.wa_id;
          const name = body.entry[0].changes[0].value.contacts?.[0]?.profile?.name || 'Unknown';
          const message = body.entry[0].changes[0].value.messages[0];
          
          await this.whatsappService.handleIncomingWebhookMessage(phoneNumber, name, message);
        }
      }
    } catch (error) {
      console.error('Error handling WhatsApp Webhook:', error);
    }
  }

  // 3. Admin Dashboard: Get all conversations
  @Get('conversations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getConversations() {
    return this.whatsappService.getConversations();
  }

  // 4. Admin Dashboard: Send a manual reply
  @Post('conversations/:phone/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async sendReply(@Param('phone') phone: string, @Body('message') message: string) {
    return this.whatsappService.sendManualReply(phone, message);
  }

  // 5. Admin Dashboard: Mark conversation as read
  @Post('conversations/:phone/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async markAsRead(@Param('phone') phone: string) {
    return this.whatsappService.markConversationAsRead(phone);
  }
}
