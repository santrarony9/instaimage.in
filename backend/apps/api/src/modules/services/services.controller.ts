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

  @Roles(Role.ADMIN, Role.PHOTOGRAPHER)
  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createServiceDto: CreateServiceDto,
  ) {
    if (req.user.role === Role.PHOTOGRAPHER) {
      createServiceDto.creatorId = req.user.sub;
      createServiceDto.isApproved = false; // Require admin approval or just true
    }
    return this.servicesService.create(createServiceDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @Roles(Role.PHOTOGRAPHER)
  @Get('my-services')
  findMyServices(@Request() req: AuthenticatedRequest) {
    return this.servicesService.findByCreator(req.user.sub);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.PHOTOGRAPHER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Roles(Role.ADMIN, Role.PHOTOGRAPHER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
