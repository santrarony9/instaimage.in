import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { Role } from '@app/auth';
import { SellersService } from '../sellers/sellers.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly SellersService: SellersService,
    private readonly emailService: EmailService,
  ) {}

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

    const payload = { sub: user._id, email: user.email, role: user.role };

    // Give welcome wallet bonus
    if (user.role === Role.CUSTOMER) {
      await this.usersService.addWalletBalance(
        user._id.toString(),
        500,
        'Welcome Bonus',
      );
    }

    // Send welcome email asynchronously
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

    // Also create the seller record
    await this.SellersService.create({
      name: user.name,
      email: user.email,
      phone: '0000000000', // Needs update later
      bankDetails: 'Pending',
      isActive: true,
      // @ts-ignore
      userId: user._id,
    });

    const payload = { sub: user._id, email: user.email, role: user.role };

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

    const payload = { sub: user._id, email: user.email, role: user.role };
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
      // Create user if they don't exist
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
      });

      await this.usersService.addWalletBalance(
        user._id.toString(),
        500,
        'Welcome Bonus',
      );
      this.emailService.sendWelcomeEmail(user.email, user.name);
    }

    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Return success anyway to prevent email enumeration
      return {
        success: true,
        message: 'If an account exists, a reset link was sent.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, 10);

    await this.usersService.update(user._id.toString(), {
      resetPasswordToken: tokenHash,
      resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour from now
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
