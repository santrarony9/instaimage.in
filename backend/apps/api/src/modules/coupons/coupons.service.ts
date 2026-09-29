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

  async validateCoupon(code: string, orderValue: number) {
    const coupon = await this.couponsRepository.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      throw new Error('Invalid promo code');
    }
    if (!coupon.isActive) {
      throw new Error('This promo code is currently inactive');
    }
    
    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      throw new Error('This promo code is not active yet');
    }
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      throw new Error('This promo code has expired');
    }
    
    if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
      throw new Error(`This promo code requires a minimum order value of ₹${coupon.minOrderValue}`);
    }
    
    if (coupon.maxUsageLimit && coupon.currentUsageCount >= coupon.maxUsageLimit) {
      throw new Error('This promo code has reached its maximum usage limit');
    }
    
    return coupon;
  }

  async incrementUsage(id: string) {
    const coupon = await this.couponsRepository.findOne({ _id: id });
    if (!coupon) return null;
    
    const query: any = { _id: id };
    if (coupon.maxUsageLimit) {
      query.currentUsageCount = { $lt: coupon.maxUsageLimit };
    }
    
    const updated = await this.couponsRepository.findOneAndUpdate(
      query,
      { $inc: { currentUsageCount: 1 } }
    );
    
    if (!updated && coupon.maxUsageLimit) {
      throw new Error('Coupon usage limit reached during checkout.');
    }
    
    return updated;
  }
}
