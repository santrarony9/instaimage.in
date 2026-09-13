import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard, RolesGuard, Roles, Role } from '@app/auth';

@Controller('support-inbox')
export class SupportInboxController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('conversations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getConversations() {
    return this.whatsappService.getConversations();
  }

  @Post('conversations/:phone/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async sendReply(@Param('phone') phone: string, @Body('message') message: string) {
    return this.whatsappService.sendManualReply(phone, message);
  }

  @Post('conversations/:phone/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async markAsRead(@Param('phone') phone: string) {
    return this.whatsappService.markConversationAsRead(phone);
  }
}
