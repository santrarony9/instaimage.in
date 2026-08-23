import { Test, TestingModule } from '@nestjs/testing';
import { SellerAvailabilityController } from './seller-availability.controller';

describe('SellerAvailabilityController', () => {
  let controller: SellerAvailabilityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerAvailabilityController],
    }).compile();

    controller = module.get<SellerAvailabilityController>(
      SellerAvailabilityController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
