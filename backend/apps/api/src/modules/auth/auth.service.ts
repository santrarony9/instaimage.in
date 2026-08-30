import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import {
  RegisterDto,
  LoginDto,
  SendWhatsappOtpDto,
  VerifyWhatsappOtpDto,
  LinkWhatsappPhoneDto,
} from './dto/auth.dto';
import { Role } from '@app/auth';
import { SellersService } from '../sellers/sellers.service';
import { EmailService } from '../email/email.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { Otp } from './schemas/otp.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly SellersService: SellersService,
    private readonly emailService: EmailService,
    private readonly whatsappService: WhatsappService,
    @InjectModel(Otp.name) private readonly otpModel: Model<Otp>,
  ) {}

  private cleanPhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      cleaned = `91${cleaned}`;
    }
    return cleaned;
  }

  /**
   * Send WhatsApp OTP for Registration / Login / Phone Linking
   */
  async sendWhatsappOtp(dto: SendWhatsappOtpDto) {
    const phone = this.cleanPhone(dto.phone);
    if (phone.length < 10) {
      throw new BadRequestException('Please provide a valid phone number');
    }

    // Rate limiting: allow 1 OTP per 30 seconds per phone
    const recentOtp = await this.otpModel
      .findOne({ phone })
      .sort({ createdAt: -1 });

    if (recentOtp && recentOtp.createdAt) {
      const secondsSinceLast =
        (Date.now() - new Date(recentOtp.createdAt).getTime()) / 1000;
      if (secondsSinceLast < 30) {
        throw new BadRequestException(
          `Please wait ${Math.ceil(30 - secondsSinceLast)} seconds before requesting a new OTP.`,
        );
      }
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    // Remove older OTPs for this phone
    await this.otpModel.deleteMany({ phone });

    // Store new OTP (5 minutes validity)
    await this.otpModel.create({
      phone,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Send via WhatsApp API
    const sendResult = await this.whatsappService.sendOtpMessage(
      phone,
      otp,
      dto.name || 'Customer',
    );

    this.logger.log(`WhatsApp OTP sent to ${phone} (Result: ${JSON.stringify(sendResult)})`);

    return {
      success: true,
      message: 'OTP has been sent to your WhatsApp successfully.',
    };
  }

  /**
   * Verify WhatsApp OTP for Registration & Login (Signs 15-day token)
   */
  async verifyWhatsappOtp(dto: VerifyWhatsappOtpDto) {
    const phone = this.cleanPhone(dto.phone);

    const otpRecord = await this.otpModel
      .findOne({
        phone,
        expiresAt: { $gt: new Date() },
      })
      .sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new BadRequestException('OTP has expired or was not requested. Please request a new code.');
    }

    if (otpRecord.attempts >= 5) {
      await this.otpModel.deleteMany({ phone });
      throw new BadRequestException('Too many incorrect attempts. Please request a new OTP.');
    }

    const isMatch = await bcrypt.compare(dto.otp.trim(), otpRecord.otpHash);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      throw new BadRequestException('Invalid verification code. Please check and try again.');
    }

    // Remove used OTP
    await this.otpModel.deleteMany({ phone });

    // Find or create User
    let user = await this.usersService.findByPhone(phone);

    if (!user) {
      // Create new customer account
      const salt = await bcrypt.genSalt(10);
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, salt);

      let referredBy = undefined;
      if (dto.referralCode) {
        const referrer = await this.usersService.findByReferralCode(
          dto.referralCode.trim().toUpperCase(),
        );
        if (referrer) {
          referredBy = referrer._id;
        }
      }

      const referralCode =
        'INSTA' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const generatedEmail = `user_${phone}@instaimage.in`;

      user = await this.usersService.create({
        name: dto.name?.trim() || `User ${phone.slice(-4)}`,
        email: generatedEmail,
        passwordHash,
        phone,
        isWhatsappVerified: true,
        role: Role.CUSTOMER,
        referralCode,
        referredBy,
      });

      // Welcome wallet bonus
      await this.usersService.addWalletBalance(
        user._id.toString(),
        500,
        'Welcome Bonus',
      );
    } else {
      // Mark verified if not already
      if (!user.isWhatsappVerified) {
        await this.usersService.update(user._id.toString(), {
          isWhatsappVerified: true,
        });
      }
    }

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isWhatsappVerified: true,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isWhatsappVerified: true,
        walletBalance: user.walletBalance,
        referralCode: user.referralCode,
      },
    };
  }

  /**
   * Link and Verify WhatsApp phone for existing users (e.g. Google Sign-in users)
   */
  async linkWhatsappPhone(userId: string, dto: LinkWhatsappPhoneDto) {
    const phone = this.cleanPhone(dto.phone);

    const otpRecord = await this.otpModel
      .findOne({
        phone,
        expiresAt: { $gt: new Date() },
      })
      .sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new BadRequestException('OTP has expired or was not requested. Please request a new code.');
    }

    const isMatch = await bcrypt.compare(dto.otp.trim(), otpRecord.otpHash);
    if (!isMatch) {
      throw new BadRequestException('Invalid verification code.');
    }

    await this.otpModel.deleteMany({ phone });

    // Check if phone is already claimed by another user
    const existing = await this.usersService.findByPhone(phone);
    if (existing && existing._id.toString() !== userId) {
      throw new BadRequestException('This WhatsApp number is already linked to another account.');
    }

    const updatedUser = await this.usersService.update(userId, {
      phone,
      isWhatsappVerified: true,
    });

    if (!updatedUser) {
      throw new BadRequestException('User not found');
    }

    const payload = {
      sub: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      isWhatsappVerified: true,
    };

    return {
      success: true,
      access_token: this.jwtService.sign(payload),
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        isWhatsappVerified: true,
        walletBalance: updatedUser.walletBalance,
        referralCode: updatedUser.referralCode,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    let referredBy = undefined;
    if (registerDto.referralCode) {
      const referrer = await this.usersService.findByReferralCode(
        registerDto.referralCode,
      );
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    const referralCode =
      'INSTA' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      passwordHash,
      role:
        registerDto.email === 'admin@instaimage.com'
          ? Role.ADMIN
          : Role.CUSTOMER,
      referralCode,
      referredBy,
    });

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isWhatsappVerified: user.isWhatsappVerified,
    };

    if (user.role === Role.CUSTOMER) {
      await this.usersService.addWalletBalance(
        user._id.toString(),
        500,
        'Welcome Bonus',
      );
    }

    this.emailService.sendWelcomeEmail(user.email, user.name);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isWhatsappVerified: user.isWhatsappVerified,
      },
    };
  }

  async registerSeller(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      passwordHash,
      role: Role.SELLER,
    });

    await this.SellersService.create({
      name: user.name,
      email: user.email,
      phone: '0000000000',
      bankDetails: 'Pending',
      isActive: true,
      // @ts-ignore
      userId: user._id,
    });

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isWhatsappVerified: user.isWhatsappVerified,
    };

    this.emailService.sendWelcomeEmail(user.email, user.name);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isWhatsappVerified: user.isWhatsappVerified,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isWhatsappVerified: user.isWhatsappVerified,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isWhatsappVerified: user.isWhatsappVerified,
      },
    };
  }

  async adminRegister(registerDto: RegisterDto & { role: string }) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    let parsedRole = Role.CUSTOMER;
    if (registerDto.role === 'ADMIN') parsedRole = Role.ADMIN;
    if (registerDto.role === 'SELLER') parsedRole = Role.SELLER;

    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      passwordHash,
      role: parsedRole,
    });

    if (parsedRole === Role.SELLER) {
      await this.SellersService.create({
        name: user.name,
        email: user.email,
        phone: '0000000000',
        bankDetails: 'Pending',
        isActive: true,
        // @ts-ignore
        userId: user._id,
      });
    }

    this.emailService.sendWelcomeEmail(user.email, user.name);

    return {
      success: true,
      user: { id: user._id, name: user.name, role: user.role },
    };
  }

  async validateGoogleUser(googleUser: any) {
    let user = await this.usersService.findByEmail(googleUser.email);

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(
        Math.random().toString(36).slice(-8),
        salt,
      );
      const referralCode =
        'INSTA' + Math.random().toString(36).substring(2, 8).toUpperCase();

      user = await this.usersService.create({
        name: googleUser.name,
        email: googleUser.email,
        passwordHash,
        role: Role.CUSTOMER,
        referralCode,
        isWhatsappVerified: false,
      });

      await this.usersService.addWalletBalance(
        user._id.toString(),
        500,
        'Welcome Bonus',
      );
      this.emailService.sendWelcomeEmail(user.email, user.name);
    }

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isWhatsappVerified: user.isWhatsappVerified,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isWhatsappVerified: user.isWhatsappVerified,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return {
        success: true,
        message: 'If an account exists, a reset link was sent.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, 10);

    await this.usersService.update(user._id.toString(), {
      resetPasswordToken: tokenHash,
      resetPasswordExpires: new Date(Date.now() + 3600000),
    });

    const resetLink = `https://instaimage.in/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    this.emailService.sendPasswordResetEmail(user.email, resetLink);

    return {
      success: true,
      message: 'If an account exists, a reset link was sent.',
    };
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    if (user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Password reset token has expired');
    }

    const isValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isValid) {
      throw new BadRequestException('Invalid password reset token');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.usersService.update(user._id.toString(), {
      passwordHash,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });

    return { success: true, message: 'Password has been reset successfully' };
  }
}
