import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, Roles, Role } from '@app/auth';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('register-creator')
  registerSeller(@Body() registerDto: RegisterDto) {
    return this.authService.registerSeller(registerDto);
  }

  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('admin-register')
  @Roles(Role.ADMIN)
  adminRegister(@Body() registerDto: RegisterDto & { role: string }) {
    return this.authService.adminRegister(registerDto);
  }
}
