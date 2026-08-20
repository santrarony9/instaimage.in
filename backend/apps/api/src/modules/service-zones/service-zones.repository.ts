import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractRepository } from '@app/database';
import { ServiceZone } from './schemas/service-zone.schema';

@Injectable()
export class ServiceZonesRepository extends AbstractRepository<ServiceZone> {
  protected readonly logger = new Logger(ServiceZonesRepository.name);

  constructor(
    @InjectModel(ServiceZone.name) serviceZoneModel: Model<ServiceZone>,
  ) {
    super(serviceZoneModel);
  }
}
