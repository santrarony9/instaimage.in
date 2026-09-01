import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Req,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles, Role, Public } from '@app/auth';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/addresses')
  getAddresses(@Req() req: any) {
    return this.usersService.getAddresses(req.user.sub);
  }

  @Post('me/addresses')
  addAddress(@Req() req: any, @Body() addressData: any) {
    return this.usersService.addAddress(req.user.sub, addressData);
  }

  @Patch('me')
  async updateProfile(
    @Req() req: any,
    @Body() updateData: { name?: string; email?: string; dateOfBirth?: string; profileImage?: string },
  ) {
    const payload: any = {};
    if (updateData.name !== undefined) payload.name = updateData.name;
    if (updateData.email !== undefined) payload.email = updateData.email;
    if (updateData.profileImage !== undefined) payload.profileImage = updateData.profileImage;
    if (updateData.dateOfBirth) {
      payload.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    return this.usersService.update(req.user.sub, payload);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query('search') search?: string) {
    return this.usersService.findAll(search);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.updateRole(id, role);
  }

  @Get('me/wallet')
  getWallet(@Req() req: any) {
    return this.usersService
      .findById(req.user.sub)
      .then((user) => ({ balance: user?.walletBalance || 0 }));
  }

  @Get('me/wallet/transactions')
  getWalletTransactions(@Req() req: any) {
    return this.usersService.getWalletTransactions(req.user.sub);
  }

  @Post('me/send-verification-coupon')
  sendVerificationCoupon(
    @Req() req: any,
    @Body('email') email: string,
  ) {
    const phone = req.user.phone;
    return this.usersService.sendVerificationCoupon(
      req.user.sub,
      phone,
      email,
    );
  }

  @Post('me/redeem-coupon')
  redeemCoupon(
    @Req() req: any,
    @Body('code') code: string,
  ) {
    return this.usersService.redeemVerificationCoupon(req.user.sub, code);
  }

  @Post(':id/wallet')
  @Roles(Role.ADMIN)
  adjustWalletBalance(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Body('description') description: string,
  ) {
    return this.usersService.addWalletBalance(
      id,
      amount,
      description || 'Admin adjustment',
    );
  }
}
