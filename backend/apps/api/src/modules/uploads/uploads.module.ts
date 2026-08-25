import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadsController } from './uploads.controller';
import { MulterModule } from '@nestjs/platform-express';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { Banner, BannerSchema } from '../banners/schemas/banner.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Service.name, schema: ServiceSchema },
      { name: Banner.name, schema: BannerSchema }
    ]),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [UploadsController],
})
export class UploadsModule {}
