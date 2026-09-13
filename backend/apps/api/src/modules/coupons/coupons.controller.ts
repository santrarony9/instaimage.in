import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Roles, Role, Public, JwtAuthGuard, RolesGuard } from '@app/auth';

@Controller('coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.couponsService.findAll();
  }

  @Public()
  @Post('validate')
  async validate(@Body() body: { code: string; orderValue: number }) {
    try {
      const coupon = await this.couponsService.validateCoupon(body.code, body.orderValue);
      return { success: true, coupon };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponsService.update(id, updateCouponDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
