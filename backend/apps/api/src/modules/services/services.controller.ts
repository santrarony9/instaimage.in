import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Roles, Role, Public, JwtAuthGuard, RolesGuard } from '@app/auth';

interface AuthenticatedRequest extends ExpressRequest {
  user: { sub: string; role: string; email: string };
}

@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Roles(Role.ADMIN, Role.SELLER, Role.PHOTOGRAPHER)
  @Post('admin/ai-description')
  async generateAiDescription(
    @Body()
    data: {
      name: string;
      basePrice?: number;
      category?: string;
      tags?: string;
      roughNotes?: string;
    },
  ) {
    return this.servicesService.generateAiDescription(data);
  }

  @Roles(Role.ADMIN, Role.PHOTOGRAPHER, Role.SELLER)
  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createServiceDto: CreateServiceDto,
  ) {
    if (req.user.role === Role.PHOTOGRAPHER || req.user.role === Role.SELLER) {
      createServiceDto.creatorId = req.user.sub;
      createServiceDto.isApproved = false; // Always require admin approval for sellers
    }
    return this.servicesService.create(createServiceDto);
  }

  // Public: only returns approved services (no creator identity)
  @Public()
  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  // Admin: get ALL services including unapproved
  @Roles(Role.ADMIN)
  @Get('admin/all')
  findAllAdmin() {
    return this.servicesService.findAllAdmin();
  }

  // Admin: get only pending (unapproved) services
  @Roles(Role.ADMIN)
  @Get('pending')
  findPending() {
    return this.servicesService.findPending();
  }

  @Roles(Role.PHOTOGRAPHER, Role.SELLER)
  @Get('my-services')
  findMyServices(@Request() req: AuthenticatedRequest) {
    return this.servicesService.findByCreator(req.user.sub);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  // Admin: approve a pending service
  @Roles(Role.ADMIN)
  @Patch(':id/approve')
  approveService(@Param('id') id: string) {
    return this.servicesService.approveService(id);
  }

  // Admin: reject a pending service
  @Roles(Role.ADMIN)
  @Patch(':id/reject')
  rejectService(@Param('id') id: string) {
    return this.servicesService.rejectService(id);
  }

  @Roles(Role.ADMIN, Role.PHOTOGRAPHER, Role.SELLER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Roles(Role.ADMIN, Role.PHOTOGRAPHER, Role.SELLER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
