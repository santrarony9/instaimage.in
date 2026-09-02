import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadStatusDto } from './dto/create-lead.dto';
import { JwtAuthGuard, RolesGuard, Roles, Public, Role } from '@app/auth';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  // Public endpoint for customers to submit their wishlist
  @Public()
  @Post()
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  // Admin only endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.leadsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateLeadStatusDto: UpdateLeadStatusDto) {
    return this.leadsService.updateStatus(id, updateLeadStatusDto);
  }
}
