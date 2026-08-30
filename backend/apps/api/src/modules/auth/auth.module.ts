import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule as CoreAuthModule } from '@app/auth';
import { SellersModule } from '../sellers/sellers.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { Otp, OtpSchema } from './schemas/otp.schema';

@Module({
  imports: [
    UsersModule,
    CoreAuthModule,
    SellersModule,
    WhatsappModule,
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
