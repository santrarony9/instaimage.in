import { Injectable } from '@nestjs/common';
import { CouponsRepository } from './coupons.repository';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private readonly couponsRepository: CouponsRepository) {}

  async create(createCouponDto: CreateCouponDto) {
    return this.couponsRepository.create(createCouponDto);
  }

  async findAll() {
    return this.couponsRepository.find({});
  }

  async findOne(id: string) {
    return this.couponsRepository.findOne({ _id: id });
  }

  async update(id: string, updateCouponDto: UpdateCouponDto) {
    return this.couponsRepository.findOneAndUpdate(
      { _id: id },
      updateCouponDto,
    );
  }

  async remove(id: string) {
    return this.couponsRepository.findOneAndDelete({ _id: id });
  }
}
