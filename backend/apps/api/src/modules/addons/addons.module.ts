import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddonsService } from './addons.service';
import { AddonsController } from './addons.controller';
import { Addon, AddonSchema } from './schemas/addon.schema';
import { AddonsRepository } from './addons.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Addon.name, schema: AddonSchema }]),
  ],
  controllers: [AddonsController],
  providers: [AddonsService, AddonsRepository],
  exports: [AddonsService, AddonsRepository],
})
export class AddonsModule {}
