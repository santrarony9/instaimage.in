import { Test, TestingModule } from '@nestjs/testing';
import { SellerAvailabilityService } from './seller-availability.service';

describe('SellerAvailabilityService', () => {
  let service: SellerAvailabilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SellerAvailabilityService],
    }).compile();

    service = module.get<SellerAvailabilityService>(SellerAvailabilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
