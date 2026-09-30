import { Controller, Get, Post, Body, Query, Res, HttpStatus, UseGuards, Param, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { Response } from 'express';
import { JwtAuthGuard, RolesGuard, Roles, Role, Public } from '@app/auth';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  // 1. Webhook Verification (Meta requires this)
  @Public()
  @Version(['1', VERSION_NEUTRAL])
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
  @Version(['1', VERSION_NEUTRAL])
  @Post('webhook')
  async handleIncomingMessage(@Body() body: any, @Res() res: Response) {
    // Return 200 OK immediately to acknowledge receipt to Meta
    res.sendStatus(HttpStatus.OK);

    try {
      if (body && body.object === 'whatsapp_business_account') {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            if (change.value && change.value.messages) {
              for (const message of change.value.messages) {
                const phoneNumber = change.value.contacts?.[0]?.wa_id || message.from;
                const name = change.value.contacts?.[0]?.profile?.name || 'Unknown';
                await this.whatsappService.handleIncomingWebhookMessage(phoneNumber, name, message);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error handling WhatsApp Webhook:', error);
    }
  }

}
