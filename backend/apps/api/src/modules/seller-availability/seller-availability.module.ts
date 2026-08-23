import { Module } from '@nestjs/common';
import { SellerAvailabilityController } from './seller-availability.controller';
import { SellerAvailabilityService } from './seller-availability.service';

@Module({
  controllers: [SellerAvailabilityController],
  providers: [SellerAvailabilityService],
})
export class SellerAvailabilityModule {}
