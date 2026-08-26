import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '@app/database';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { ServicesRepository } from './services.repository';
import { Service, ServiceSchema } from './schemas/service.schema';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
    SettingsModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService, ServicesRepository],
  exports: [ServicesService],
})
export class ServicesModule {}
