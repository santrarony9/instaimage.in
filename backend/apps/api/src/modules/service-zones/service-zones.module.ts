import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '@app/database';
import { ServiceZonesController } from './service-zones.controller';
import { ServiceZonesService } from './service-zones.service';
import { ServiceZonesRepository } from './service-zones.repository';
import { ServiceZone, ServiceZoneSchema } from './schemas/service-zone.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: ServiceZone.name, schema: ServiceZoneSchema },
    ]),
  ],
  controllers: [ServiceZonesController],
  providers: [ServiceZonesService, ServiceZonesRepository],
  exports: [ServiceZonesService],
})
export class ServiceZonesModule {}
