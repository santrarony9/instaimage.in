import { Controller, Get, Patch, Param, Body, Query, Req, Post } from '@nestjs/common';
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
}
