import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Public, Roles, Role } from '@app/auth';
import {
  RegisterDto,
  LoginDto,
  SendWhatsappOtpDto,
  VerifyWhatsappOtpDto,
  LinkWhatsappPhoneDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  getMe(@Req() req: any) {
    return { user: req.user };
  }

  @Public()
  @Post('whatsapp/send-otp')
  sendWhatsappOtp(@Body() dto: SendWhatsappOtpDto) {
    return this.authService.sendWhatsappOtp(dto);
  }

  @Public()
  @Post('whatsapp/verify-otp')
  verifyWhatsappOtp(@Body() dto: VerifyWhatsappOtpDto) {
    return this.authService.verifyWhatsappOtp(dto);
  }

  @Post('whatsapp/link-phone')
  linkWhatsappPhone(@Req() req: any, @Body() dto: LinkWhatsappPhoneDto) {
    const userId = req.user?.sub || req.user?.id || req.user?._id;
    return this.authService.linkWhatsappPhone(userId, dto);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: any) {
    // Initiates the Google OAuth flow
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    const result = await this.authService.validateGoogleUser(req.user);
    // Redirect back to frontend with the token
    const frontendUrl = 'https://instaimage.in/login';
    return res.redirect(`${frontendUrl}?token=${result.access_token}`);
  }

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('register-seller')
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

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: { email: string }) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: any) {
    return this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
  }
}
