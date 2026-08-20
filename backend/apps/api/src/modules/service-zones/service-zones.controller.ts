import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ServiceZonesService } from './service-zones.service';
import { CreateServiceZoneDto } from './dto/create-service-zone.dto';
import { UpdateServiceZoneDto } from './dto/update-service-zone.dto';
import { Roles, Role, Public } from '@app/auth';

@Controller('service-zones')
export class ServiceZonesController {
  constructor(private readonly serviceZonesService: ServiceZonesService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createServiceZoneDto: CreateServiceZoneDto) {
    return this.serviceZonesService.create(createServiceZoneDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.serviceZonesService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceZonesService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServiceZoneDto: UpdateServiceZoneDto,
  ) {
    return this.serviceZonesService.update(id, updateServiceZoneDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceZonesService.remove(id);
  }
}
