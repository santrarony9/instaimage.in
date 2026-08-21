import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule as CoreAuthModule } from '@app/auth';
import { SellersModule } from '../sellers/sellers.module';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [UsersModule, CoreAuthModule, SellersModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
})
export class AuthModule {}
