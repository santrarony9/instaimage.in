import { Controller, Post, Get, Param, Body, Req } from '@nestjs/common';
import { SupportService } from './support.service';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  createTicket(
    @Req() req: any,
    @Body('subject') subject: string,
    @Body('message') message: string
  ) {
    return this.supportService.createTicket(req.user.sub, subject, message);
  }

  @Get('my-tickets')
  getMyTickets(@Req() req: any) {
    return this.supportService.getMyTickets(req.user.sub);
  }

  @Get(':id')
  getTicketById(@Req() req: any, @Param('id') id: string) {
    return this.supportService.getTicketById(req.user.sub, id);
  }

  @Post(':id/reply')
  replyToTicket(
    @Req() req: any,
    @Param('id') id: string,
    @Body('message') message: string
  ) {
    return this.supportService.replyToTicket(req.user.sub, id, message);
  }
}
