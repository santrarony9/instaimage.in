import { Injectable } from '@nestjs/common';
import { ServiceZonesRepository } from './service-zones.repository';
import { CreateServiceZoneDto } from './dto/create-service-zone.dto';
import { UpdateServiceZoneDto } from './dto/update-service-zone.dto';

@Injectable()
export class ServiceZonesService {
  constructor(
    private readonly serviceZonesRepository: ServiceZonesRepository,
  ) {}

  async create(createServiceZoneDto: CreateServiceZoneDto) {
    return this.serviceZonesRepository.create(createServiceZoneDto);
  }

  async findAll() {
    return this.serviceZonesRepository.find({});
  }

  async findOne(id: string) {
    return this.serviceZonesRepository.findOne({ _id: id });
  }

  async update(id: string, updateServiceZoneDto: UpdateServiceZoneDto) {
    return this.serviceZonesRepository.findOneAndUpdate(
      { _id: id },
      updateServiceZoneDto,
    );
  }

  async remove(id: string) {
    return this.serviceZonesRepository.findOneAndDelete({ _id: id });
  }
}
